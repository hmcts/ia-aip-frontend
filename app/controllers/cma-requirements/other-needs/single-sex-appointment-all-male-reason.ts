import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

const pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment,
  formAction: paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllMale.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllMale.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getSingleSexAppointmentAllMaleReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.singleSexAppointmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postSingleSexAppointmentAllMaleReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'reason')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.singleSexAppointmentAllMaleReasonRequired;

      const onSuccess = async () => {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          singleSexAppointmentReason: req.body['reason']
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsPrivateAppointment);
      };

      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupSingleSexAppointmentAllMaleReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment, middleware, getSingleSexAppointmentAllMaleReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment, middleware, postSingleSexAppointmentAllMaleReason(updateAppealService));

  return router;
}

export {
  setupSingleSexAppointmentAllMaleReasonController,
  getSingleSexAppointmentAllMaleReason,
  postSingleSexAppointmentAllMaleReason
};
