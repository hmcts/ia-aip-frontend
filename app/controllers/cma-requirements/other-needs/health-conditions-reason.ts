import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { textAreaValidation } from '../../../utils/validations/fields-validations';

function getHealthConditionsReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.healthConditionsReason;

    return res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.otherNeedsHealthConditions,
      formAction: paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason,
      pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.title,
      question: {
        name: 'reason',
        title: i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.heading,
        value: savedReason ? savedReason : ''
      },
      supportingEvidence: false,
      timeExtensionAllowed: false
    });
  } catch (e) {
    next(e);
  }
}

function postHealthConditionsReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { otherNeeds } = req.session.appeal.cmaRequirements;
      const savedReason: string = otherNeeds.healthConditionsReason;

      const validationErrors = textAreaValidation(req.body['reason'], 'reason', i18n.validationErrors.cmaRequirements.otherNeeds.healthConditionsReasonRequired);

      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.otherNeedsHealthConditions,
          formAction: paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason,
          pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.title,
          question: {
            name: 'reason',
            title: i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.heading,
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
        healthConditionsReason: req.body['reason']
      };

      // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
          && req.session.appeal.cmaRequirements.isEdit === true) {
          req.session.appeal.cmaRequirements.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsPastExperiences);
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
