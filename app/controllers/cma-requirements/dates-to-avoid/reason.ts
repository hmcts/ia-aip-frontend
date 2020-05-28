import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { textAreaValidation } from '../../../utils/validations/fields-validations';

function getDatesToAvoidReason(req: Request, res: Response, next: NextFunction) {
  try {
    const { datesToAvoid } = req.session.appeal.cmaRequirements;
    const last: DateToAvoid = datesToAvoid[datesToAvoid.length - 1];

    return res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingCmaRequirements.datesToAvoidEnterDate,
      formAction: paths.awaitingCmaRequirements.datesToAvoidReason,
      pageTitle: i18n.pages.cmaRequirements.datesToAvoidSection.reason.title,
      question: {
        name: 'reason',
        title: i18n.pages.cmaRequirements.datesToAvoidSection.reason.heading,
        value: last.reason ? last.reason : ''
      },
      supportingEvidence: false,
      timeExtensionAllowed: false
    });
  } catch (e) {
    next(e);
  }
}

function postDatesToAvoidReason(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { datesToAvoid } = req.session.appeal.cmaRequirements;
      const last: DateToAvoid = datesToAvoid[datesToAvoid.length - 1];

      const validationErrors = textAreaValidation(req.body['reason'], 'reason', i18n.validationErrors.cmaRequirements.datesToAvoid.reasonRequired);

      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingCmaRequirements.datesToAvoidEnterDate,
          formAction: paths.awaitingCmaRequirements.datesToAvoidReason,
          pageTitle: i18n.pages.cmaRequirements.datesToAvoidSection.reason.title,
          question: {
            name: 'reason',
            title: i18n.pages.cmaRequirements.datesToAvoidSection.reason.heading,
            value: last.reason ? last.reason : ''
          },
          supportingEvidence: false,
          timeExtensionAllowed: false,
          errorList: Object.values(validationErrors),
          errors: validationErrors
        });
      }

      last.reason = req.body['reason'];

      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
          && req.session.appeal.cmaRequirements.isEdit === true) {
          req.session.appeal.cmaRequirements.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate);
    } catch (e) {
      next(e);
    }
  };
}

function setupDatesToAvoidReasonController(middleware: Middleware[], updateAppealService?: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidReason, middleware, getDatesToAvoidReason);
  router.post(paths.awaitingCmaRequirements.datesToAvoidReason, middleware, postDatesToAvoidReason(updateAppealService));

  return router;
}

export {
  setupDatesToAvoidReasonController,
  getDatesToAvoidReason,
  postDatesToAvoidReason
};
