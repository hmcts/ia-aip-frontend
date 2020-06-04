import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment,
  formAction: paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllFemale.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllFemale.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getSingleSexAppointmentAllFemaleReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.singleSexAppointmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postSingleSexAppointmentAllFemaleReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.singleSexAppointmentAllFemaleReasonRequired;

      const onSuccess = () => {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          singleSexAppointmentReason: req.body['reason']
        };

        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
      };

      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupSingleSexAppointmentAllFemaleReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment, middleware, getSingleSexAppointmentAllFemaleReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment, middleware, postSingleSexAppointmentAllFemaleReason(updateAppealService));

  return router;
}

export {
  setupSingleSexAppointmentAllFemaleReasonController,
  getSingleSexAppointmentAllFemaleReason,
  postSingleSexAppointmentAllFemaleReason
};
