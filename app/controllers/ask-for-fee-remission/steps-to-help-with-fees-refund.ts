import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';

async function getStepsToHelpWithFees(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/steps-to-help-with-fees.njk', {
      previousPage: paths.appealSubmitted.helpWithFeesRefund,
      refundJourney: true
    });
  } catch (error) {
    next(error);
  }
}

function postStepsToHelpWithFees() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    try {
      return res.redirect(paths.appealSubmitted.helpWithFeesReferenceNumberRefund);
    } catch (error) {
      next(error);
    }
  };
}

function setupStepToHelpWithFeesRefundController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund, middleware, getStepsToHelpWithFees);
  router.post(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund, middleware, postStepsToHelpWithFees());
  return router;
}

export {
  getStepsToHelpWithFees,
  postStepsToHelpWithFees,
  setupStepToHelpWithFeesRefundController
};
