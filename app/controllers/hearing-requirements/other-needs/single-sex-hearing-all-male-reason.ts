import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getHearingRequirementsReasonHandler, handleHearingRequirementsSaveForLater } from '../common';

const pageContent = {
  previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
  formAction: paths.submitHearingRequirements.otherNeedsAllMaleHearing,
  pageTitle: i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearingAllMale.title,
  question: {
    name: 'reason',
    title: i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearingAllMale.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getSingleSexHearingAllMaleReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.hearingRequirements;
    const savedReason: string = otherNeeds.singleSexAppointmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);
  } catch (e) {
    next(e);
  }
}

function postSingleSexHearingAllMaleReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'reason')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.singleSexHearingAllMaleReasonRequired;

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

function setupSingleSexHearingAllMaleReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsAllMaleHearing, middleware, getSingleSexHearingAllMaleReason);
  router.post(paths.submitHearingRequirements.otherNeedsAllMaleHearing, middleware, postSingleSexHearingAllMaleReason(updateAppealService));

  return router;
}

export {
  setupSingleSexHearingAllMaleReasonController,
  getSingleSexHearingAllMaleReason,
  postSingleSexHearingAllMaleReason
};
