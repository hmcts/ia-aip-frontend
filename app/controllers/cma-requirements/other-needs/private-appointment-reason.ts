import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsPrivateAppointment,
  formAction: paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getPrivateAppointmentReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.singleSexAppointmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postPrivateAppointmentReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.privateAppointmentReasonRequired;

      const onSuccess = () => {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          anythingElseReason: req.body['reason']
        };

        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsHealthConditions);
      };

      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupPrivateAppointmentReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason, middleware, getPrivateAppointmentReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason, middleware, postPrivateAppointmentReason(updateAppealService));

  return router;
}

export {
  setupPrivateAppointmentReasonController,
  getPrivateAppointmentReason,
  postPrivateAppointmentReason
};
