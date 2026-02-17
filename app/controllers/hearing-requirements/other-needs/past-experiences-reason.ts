import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getHearingRequirementsReasonHandler, handleHearingRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
  formAction: paths.submitHearingRequirements.otherNeedsPastExperiencesReasons,
  pageTitle: i18n.pages.hearingRequirements.otherNeedsSection.pastExperiencesReasons.title,
  question: {
    name: 'reason',
    title: i18n.pages.hearingRequirements.otherNeedsSection.pastExperiencesReasons.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getHearingPastExperiencesReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.hearingRequirements;
    const savedReason: string = otherNeeds.pastExperiencesReason;
    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postHearingPastExperiencesReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.pastExperiencesReasonRequired;

      const onSuccess = async () => {
        req.session.appeal.hearingRequirements.otherNeeds = {
          ...req.session.appeal.hearingRequirements.otherNeeds,
          pastExperiencesReason: req.body['reason']
        };

        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };

        return req.body['saveForLater']
          ? handleHearingRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.otherNeedsAnythingElse);
      };

      return getHearingRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingPastExperiencesReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsPastExperiencesReasons, middleware, getHearingPastExperiencesReason);
  router.post(paths.submitHearingRequirements.otherNeedsPastExperiencesReasons, middleware, postHearingPastExperiencesReason(updateAppealService));

  return router;
}

export {
  setupHearingPastExperiencesReasonController,
  getHearingPastExperiencesReason,
  postHearingPastExperiencesReason
};
