import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';

async function getFeeWaiver(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/fee-waiver.njk', {
      previousPage: paths.appealSubmitted.feeSupportRefund,
      refundJourney: true
    });
  } catch (error) {
    next(error);
  }
}

function postFeeWaiver() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    try {
      resetJourneyValues(req.session.appeal.application);
      req.session.appeal.application.feeSupportPersisted = true;
      return res.redirect(paths.appealSubmitted.checkYourAnswersRefund);
    } catch (error) {
      next(error);
    }
  };
}

function setupFeeWaiverRefundController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.feeWaiverRefund, middleware, getFeeWaiver);
  router.post(paths.appealSubmitted.feeWaiverRefund, middleware, postFeeWaiver());
  return router;
}

// Function used in CYA page edit mode, when the start page option is changed other values should be reset and the journey should start from the new selected option
function resetJourneyValues(application: AppealApplication) {
  application.lateAsylumSupportRefNumber = null;
  application.lateHelpWithFeesOption = null;
  application.lateHelpWithFeesRefNumber = null;
  application.lateLocalAuthorityLetters = null;
}

export {
  getFeeWaiver,
  postFeeWaiver,
  setupFeeWaiverRefundController,
  resetJourneyValues
};
