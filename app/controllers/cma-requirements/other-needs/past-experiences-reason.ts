import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsPastExperiences,
  formAction: paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getPastExperiencesReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.pastExperiencesReason;
    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postPastExperiencesReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.pastExperiencesReasonRequired;

      const onSuccess = async () => {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          pastExperiencesReason: req.body['reason']
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return req.body['saveForLater']
          ? handleCmaRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsAnythingElse);
      };

      return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupPastExperiencesReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons, middleware, getPastExperiencesReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons, middleware, postPastExperiencesReason(updateAppealService));

  return router;
}

export {
  setupPastExperiencesReasonController,
  getPastExperiencesReason,
  postPastExperiencesReason
};
