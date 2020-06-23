import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsHealthConditions,
  formAction: paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getHealthConditionsReason(req: Request, res: Response, next: NextFunction) {

  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.healthConditionsReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }

}

function postHealthConditionsReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.healthConditionsReasonRequired;

      const onSuccess = async () => {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          healthConditionsReason: req.body['reason']
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsPastExperiences);
      };

      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupHealthConditionsReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason, middleware, getHealthConditionsReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason, middleware, postHealthConditionsReason(updateAppealService));

  return router;
}

export {
  setupHealthConditionsReasonController,
  getHealthConditionsReason,
  postHealthConditionsReason
};
