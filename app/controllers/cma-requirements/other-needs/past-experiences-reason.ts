import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { textAreaValidation } from '../../../utils/validations/fields-validations';

function getPastExperiencesReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.pastExperiencesReason;

    return res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.otherNeedsPastExperiences,
      formAction: paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons,
      pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.title,
      question: {
        name: 'reason',
        title: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.heading,
        value: savedReason ? savedReason : ''
      },
      supportingEvidence: false,
      timeExtensionAllowed: false
    });
  } catch (e) {
    next(e);
  }
}

function postPastExperiencesReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { otherNeeds } = req.session.appeal.cmaRequirements;
      const savedReason: string = otherNeeds.pastExperiencesReason;

      const validationErrors = textAreaValidation(req.body['reason'], 'reason', i18n.validationErrors.cmaRequirements.otherNeeds.pastExperiencesReasonRequired);

      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.otherNeedsPastExperiences,
          formAction: paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons,
          pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.title,
          question: {
            name: 'reason',
            title: i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.heading,
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
        pastExperiencesReason: req.body['reason']
      };

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
          && req.session.appeal.cmaRequirements.isEdit === true) {
          req.session.appeal.cmaRequirements.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.otherNeedsAnythingElse);
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
