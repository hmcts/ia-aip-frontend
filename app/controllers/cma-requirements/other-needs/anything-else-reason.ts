import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsAnythingElse,
  formAction: paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getAnythingElseReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.anythingElseReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postAnythingElseReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.anythingElseReasonRequired;

    const onSuccess = async () => {
      req.session.appeal.cmaRequirements.otherNeeds = {
        ...req.session.appeal.cmaRequirements.otherNeeds,
        anythingElseReason: req.body['reason']
      };

      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      return req.body['saveForLater']
        ? handleCmaRequirementsSaveForLater(req, res)
        : getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.taskList);
    };

    return getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

  };
}

function setupAnythingElseReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons, middleware, getAnythingElseReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons, middleware, postAnythingElseReason(updateAppealService));

  return router;
}

export {
  setupAnythingElseReasonController,
  getAnythingElseReason,
  postAnythingElseReason
};
