import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getHearingRequirementsReasonHandler, handleHearingRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
  formAction: paths.submitHearingRequirements.otherNeedsAllFemaleHearing,
  pageTitle: i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearingAllFemale.title,
  question: {
    name: 'reason',
    title: i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearingAllFemale.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getSingleSexHearingAllFemaleReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.hearingRequirements;
    const savedReason: string = otherNeeds.singleSexAppointmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postSingleSexHearingAllFemaleReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'reason')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.singleSexHearingAllFemaleReasonRequired;
      const onSuccess = async () => {
        req.session.appeal.hearingRequirements.otherNeeds = {
          ...req.session.appeal.hearingRequirements.otherNeeds,
          singleSexAppointmentReason: req.body['reason']
        };

        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return req.body['saveForLater']
          ? handleHearingRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion);
      };

      return getHearingRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupSingleSexHearingAllFemaleReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsAllFemaleHearing, middleware, getSingleSexHearingAllFemaleReason);
  router.post(paths.submitHearingRequirements.otherNeedsAllFemaleHearing, middleware, postSingleSexHearingAllFemaleReason(updateAppealService));

  return router;
}

export {
  setupSingleSexHearingAllFemaleReasonController,
  getSingleSexHearingAllFemaleReason,
  postSingleSexHearingAllFemaleReason
};
