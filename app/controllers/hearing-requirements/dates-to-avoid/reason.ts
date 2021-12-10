import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getHearingRequirementsReasonHandler, handleHearingRequirementsSaveForLater } from '../common';

const formAction = paths.submitHearingRequirements.hearingDateToAvoidReasons;
const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

let pageContent = {
  formAction,
  pageTitle: i18n.pages.hearingRequirements.datesToAvoidSection.reason.title,
  previousPage: previousPage,
  question: {
    name: 'reason',
    title: i18n.pages.hearingRequirements.datesToAvoidSection.reason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getDatesToAvoidReasonWithId(req: Request, res: Response, next: NextFunction) {
  try {

    const dateId = req.params.id;

    pageContent.formAction = `${formAction}/${dateId}`;

    const { datesToAvoid } = req.session.appeal.hearingRequirements;
    const dateToAvoid: CmaDateToAvoid = datesToAvoid.dates[dateId];

    pageContent.question.value = dateToAvoid.reason ? dateToAvoid.reason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function getDatesToAvoidReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { datesToAvoid } = req.session.appeal.hearingRequirements;
    const last: CmaDateToAvoid = datesToAvoid.dates[datesToAvoid.dates.length - 1];

    pageContent.question.value = last.reason ? last.reason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postDatesToAvoidReasonWithId(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const dateId = req.params.id;

      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.datesToAvoid.reasonRequired;

      const onSuccess = async () => {

        const { datesToAvoid } = req.session.appeal.hearingRequirements;
        let dateToAvoid: CmaDateToAvoid = datesToAvoid.dates[dateId];
        dateToAvoid.reason = req.body['reason'];

        await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
        return req.body['saveForLater']
          ? handleHearingRequirementsSaveForLater(req, res)
          : res.redirect(paths.submitHearingRequirements.taskList);
      };

      await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
      return getHearingRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function postDatesToAvoidReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.datesToAvoid.reasonRequired;

      const onSuccess = async () => {
        const { datesToAvoid } = req.session.appeal.hearingRequirements;
        let dateToEdit: CmaDateToAvoid = datesToAvoid.dates[datesToAvoid.dates.length - 1];
        dateToEdit.reason = req.body['reason'];

        await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);

        return req.body['saveForLater']
          ? handleHearingRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.hearingDateToAvoidNew);

        res.redirect(paths.submitHearingRequirements.hearingDateToAvoidNew);
      };
      await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
      return getHearingRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupHearingDatesToAvoidReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.hearingDateToAvoidReasons, middleware, getDatesToAvoidReason);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidReasonsWithId, middleware, getDatesToAvoidReasonWithId);
  router.post(paths.submitHearingRequirements.hearingDateToAvoidReasons, middleware, postDatesToAvoidReason(updateAppealService));
  router.post(paths.submitHearingRequirements.hearingDateToAvoidReasonsWithId, middleware, postDatesToAvoidReasonWithId(updateAppealService));

  return router;
}

export {
  setupHearingDatesToAvoidReasonController,
  getDatesToAvoidReason,
  getDatesToAvoidReasonWithId,
  postDatesToAvoidReason,
  postDatesToAvoidReasonWithId
};
