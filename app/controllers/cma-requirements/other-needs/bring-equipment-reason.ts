import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { textAreaValidation } from '../../../utils/validations/fields-validations';

function getMultimediaEquipmentReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.bringOwnMultimediaEquipmentReason;

    return res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion,
      formAction: paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason,
      pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.title,
      question: {
        name: 'reason',
        title: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.heading,
        value: savedReason ? savedReason : ''
      },
      supportingEvidence: false,
      timeExtensionAllowed: false
    });
  } catch (e) {
    next(e);
  }
}

function postMultimediaEquipmentReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { otherNeeds } = req.session.appeal.cmaRequirements;
      const savedReason: string = otherNeeds.bringOwnMultimediaEquipmentReason;

      const validationErrors = textAreaValidation(req.body['reason'], 'reason', i18n.validationErrors.cmaRequirements.otherNeeds.bringEquipmentReasonRequired);

      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion,
          formAction: paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason,
          pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.title,
          question: {
            name: 'reason',
            title: i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.heading,
            value: savedReason ? savedReason : ''
          },
          supportingEvidence: false,
          timeExtensionAllowed: false,
          errorList: Object.values(validationErrors),
          errors: validationErrors
        });
      }

      req.session.appeal.cmaRequirements.otherNeeds = {
        ...req.session.appeal.cmaRequirements.otherNeeds,
        bringOwnMultimediaEquipmentReason: req.body['reason']
      };

      // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
          && req.session.appeal.cmaRequirements.isEdit === true) {
          req.session.appeal.cmaRequirements.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
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
