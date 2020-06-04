import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { textAreaValidation } from '../../../utils/validations/fields-validations';

function getPrivateAppointmentReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.singleSexAppointmentReason;

    return res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.otherNeedsPrivateAppointment,
      formAction: paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason,
      pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.title,
      question: {
        name: 'reason',
        title: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.heading,
        value: savedReason ? savedReason : ''
      },
      supportingEvidence: false,
      timeExtensionAllowed: false
    });
  } catch (e) {
    next(e);
  }
}

function postPrivateAppointmentReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { otherNeeds } = req.session.appeal.cmaRequirements;
      const savedReason: string = otherNeeds.singleSexAppointmentReason;

      const validationErrors = textAreaValidation(req.body['reason'], 'reason', i18n.validationErrors.cmaRequirements.otherNeeds.privateAppointmentReasonRequired);

      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.otherNeedsPrivateAppointment,
          formAction: paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason,
          pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.title,
          question: {
            name: 'reason',
            title: i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.heading,
            value: savedReason ? savedReason : ''
          },
          supportingEvidence: false,
          timeExtensionAllowed: false,
          errorList: Object.values(validationErrors),
          error: validationErrors
        });
      }

      req.session.appeal.cmaRequirements.otherNeeds = {
        ...req.session.appeal.cmaRequirements.otherNeeds,
        singleSexAppointmentReason: req.body['reason']
      };

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
          && req.session.appeal.cmaRequirements.isEdit === true) {
          req.session.appeal.cmaRequirements.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsHealthConditions);
    } catch (e) {
      next(e);
    }
  };
}

function setupPrivateAppointmentReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason, middleware, getPrivateAppointmentReason);
  router.post(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason, middleware, postPrivateAppointmentReason(updateAppealService));

  return router;
}

export {
  setupPrivateAppointmentReasonController,
  getPrivateAppointmentReason,
  postPrivateAppointmentReason
};
