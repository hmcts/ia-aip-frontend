import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { getCmaRequirementsReasonHandler, handleCmaRequirementsSaveForLater } from '../common';

let pageContent = {
  previousPage: paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion,
  formAction: paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason,
  pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.title,
  question: {
    name: 'reason',
    title: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.heading,
    value: ''
  },
  supportingEvidence: false,
  timeExtensionAllowed: false
};

function getMultimediaEquipmentReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.bringOwnMultimediaEquipmentReason;

    pageContent.question.value = savedReason ? savedReason : '';

    return res.render('templates/textarea-question-page.njk', pageContent);

  } catch (e) {
    next(e);
  }
}

function postMultimediaEquipmentReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onValidationErrorMessage = i18n.validationErrors.cmaRequirements.otherNeeds.bringEquipmentReasonRequired;

      const onSuccess = () => {
        req.session.appeal.cmaRequirements.otherNeeds = {
          ...req.session.appeal.cmaRequirements.otherNeeds,
          bringOwnMultimediaEquipmentReason: req.body['reason']
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

function setupMultimediaEquipmentReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason, middleware, getMultimediaEquipmentReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason, middleware, postMultimediaEquipmentReason(updateAppealService));

  return router;
}

export {
  setupMultimediaEquipmentReasonController,
  getMultimediaEquipmentReason,
  postMultimediaEquipmentReason
};
