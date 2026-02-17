import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

const formAction = paths.awaitingCmaRequirements.datesToAvoidReason;
const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

let pageContent = {
  previousPage: previousPage,
  formAction,
  pageTitle: i18n.pages.cmaRequirements.datesToAvoidSection.reason.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.datesToAvoidSection.reason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getDatesToAvoidReasonWithId(req: Request, res: Response, next: NextFunction) {
  try {

    const dateId = req.params.id;

    pageContent.formAction = `${formAction}/${dateId}`;

    const { datesToAvoid } = req.session.appeal.cmaRequirements;
    const dateToAvoid: CmaDateToAvoid = datesToAvoid.dates[dateId];

    pageContent.question.value = dateToAvoid.reason ? dateToAvoid.reason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function getDatesToAvoidReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { datesToAvoid } = req.session.appeal.cmaRequirements;
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

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.datesToAvoid.reasonRequired;

      const onSuccess = async () => {

        const { datesToAvoid } = req.session.appeal.cmaRequirements;
        let dateToAvoid: CmaDateToAvoid = datesToAvoid.dates[dateId];
        dateToAvoid.reason = req.body['reason'];

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : res.redirect(paths.awaitingCmaRequirements.checkAndSend);
      };

      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function postDatesToAvoidReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.datesToAvoid.reasonRequired;

      const onSuccess = async () => {
        const { datesToAvoid } = req.session.appeal.cmaRequirements;
        let dateToEdit: CmaDateToAvoid = datesToAvoid.dates[datesToAvoid.dates.length - 1];
        dateToEdit.reason = req.body['reason'];

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate);
      };
      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupDatesToAvoidReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidReason, middleware, getDatesToAvoidReason);
  router.get(paths.awaitingCmaRequirements.datesToAvoidReasonWithId, middleware, getDatesToAvoidReasonWithId);
  router.post(paths.awaitingCmaRequirements.datesToAvoidReason, middleware, postDatesToAvoidReason(updateAppealService));
  router.post(paths.awaitingCmaRequirements.datesToAvoidReasonWithId, middleware, postDatesToAvoidReasonWithId(updateAppealService));

  return router;
}

export {
  setupDatesToAvoidReasonController,
  getDatesToAvoidReason,
  getDatesToAvoidReasonWithId,
  postDatesToAvoidReason,
  postDatesToAvoidReasonWithId
};
