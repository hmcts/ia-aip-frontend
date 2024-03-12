import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { asylumSupportValidation } from '../../utils/validations/fields-validations';

async function getAsylumSupport(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const asylumSupportRefNumber = req.session.appeal.application.asylumSupportRefNumber || null;
    return res.render('appeal-application/fee-support/asylum-support.njk', {
      previousPage: paths.appealSubmitted.feeSupportRefund,
      formAction: paths.appealSubmitted.asylumSupportRefund,
      asylumSupportRefNumber,
      saveAndContinue: true,
      refundJourney: true
    });
  } catch (error) {
    next(error);
  }
}

function postAsylumSupport(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    async function persistAppeal(appeal: Appeal, refundFeatureEnabled) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], refundFeatureEnabled);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      const validation = asylumSupportValidation(req.body);
      if (validation) {
        return res.render('appeal-application/fee-support/asylum-support.njk', {
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealSubmitted.feeSupportRefund,
          pageTitle: i18n.pages.asylumSupportPage.title,
          formAction: paths.appealSubmitted.asylumSupportRefund,
          saveAndContinue: true,
          refundJourney: true
        });
      }
      const selectedValue = req.body['asylumSupportRefNumber'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          asylumSupportRefNumber: selectedValue,
          feeSupportPersisted: true
        }
      };
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      resetJourneyValues(appeal.application);
      await persistAppeal(appeal, refundFeatureEnabled);
      return res.redirect(paths.appealSubmitted.checkYourAnswersRefund);
    } catch (error) {
      next(error);
    }
  };
}

function setupAsylumSupportRefundController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.asylumSupportRefund, middleware, getAsylumSupport);
  router.post(paths.appealSubmitted.asylumSupportRefund, middleware, postAsylumSupport(updateAppealService));
  return router;
}

// Function used in CYA page edit mode, when the start page option is changed other values should be reset and the journey should start from the new selected option
function resetJourneyValues(application: AppealApplication) {
  application.helpWithFeesOption = null;
  application.helpWithFeesRefNumber = null;
  application.localAuthorityLetters = null;
}

export {
  getAsylumSupport,
  postAsylumSupport,
  setupAsylumSupportRefundController,
  resetJourneyValues
};
