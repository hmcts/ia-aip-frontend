import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getRedirectPage } from '../../utils/utils';

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

function postStepsToHelpWithFees(updateAppealService: UpdateAppealService) {
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
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(req.session.appeal, refundFeatureEnabled);
      const defaultRedirect = paths.appealSubmitted.helpWithFeesReferenceNumberRefund;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupStepToHelpWithFeesRefundController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund, middleware, getStepsToHelpWithFees);
  router.post(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund, middleware, postStepsToHelpWithFees(updateAppealService));
  return router;
}

export {
  getStepsToHelpWithFees,
  postStepsToHelpWithFees,
  setupStepToHelpWithFeesRefundController
};
