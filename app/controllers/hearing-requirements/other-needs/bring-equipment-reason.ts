import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getHearingRequirementsReasonHandler, handleHearingRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
  formAction: paths.submitHearingRequirements.otherNeedsMultimediaEquipmentReason,
  pageTitle: i18n.pages.hearingRequirements.otherNeedsSection.bringEquipmentReason.title,
  question: {
    name: 'reason',
    title: i18n.pages.hearingRequirements.otherNeedsSection.bringEquipmentReason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getHearingMultimediaEquipmentReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.hearingRequirements;
    const savedReason: string = otherNeeds.bringOwnMultimediaEquipmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);

  } catch (e) {
    next(e);
  }
}

function postHearingMultimediaEquipmentReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onValidationErrorMessage = i18n.validationErrors.hearingRequirements.otherNeeds.bringEquipmentReasonRequired;

      const onSuccess = async () => {
        req.session.appeal.hearingRequirements.otherNeeds = {
          ...req.session.appeal.hearingRequirements.otherNeeds,
          bringOwnMultimediaEquipmentReason: req.body['reason']
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        return req.body['saveForLater']
          ? handleHearingRequirementsSaveForLater(req, res)
          : getConditionalRedirectUrl(req, res, paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion);
      };

      return getHearingRequirementsReasonHandler(pageContent, onValidationErrorMessage, onSuccess, req, res, next);

    } catch (e) {
      next(e);
    }
  };
}

function setupHearingMultimediaEquipmentReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentReason, middleware, getHearingMultimediaEquipmentReason);
  router.post(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentReason, middleware, postHearingMultimediaEquipmentReason(updateAppealService));

  return router;
}

export {
  setupHearingMultimediaEquipmentReasonController,
  getHearingMultimediaEquipmentReason,
  postHearingMultimediaEquipmentReason
};
