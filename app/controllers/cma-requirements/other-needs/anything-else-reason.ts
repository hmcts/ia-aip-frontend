import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { textAreaValidation } from '../../../utils/validations/fields-validations';

function getAnythingElseReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherNeeds } = req.session.appeal.cmaRequirements;
    const savedReason: string = otherNeeds.anythingElseReason;

    return res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.otherNeedsAnythingElse,
      formAction: paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons,
      pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.title,
      question: {
        name: 'reason',
        title: i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.heading,
        value: savedReason ? savedReason : ''
      },
      supportingEvidence: false,
      timeExtensionAllowed: false
    });
  } catch (e) {
    next(e);
  }
}

function postAnythingElseReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { otherNeeds } = req.session.appeal.cmaRequirements;
      const savedReason: string = otherNeeds.anythingElseReason;

      const validationErrors = textAreaValidation(req.body['reason'], 'reason', i18n.validationErrors.cmaRequirements.otherNeeds.anythingElseReasonRequired);

      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.otherNeedsAnythingElse,
          formAction: paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons,
          pageTitle: i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.title,
          question: {
            name: 'reason',
            title: i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.heading,
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
        anythingElseReason: req.body['reason']
      };

      // await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
          && req.session.appeal.cmaRequirements.isEdit === true) {
          req.session.appeal.cmaRequirements.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.taskList);
    } catch (e) {
      next(e);
    }
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
