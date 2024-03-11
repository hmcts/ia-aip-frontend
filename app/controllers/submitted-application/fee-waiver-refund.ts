import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getRedirectPage } from '../../utils/utils';

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

function postFeeWaiver(updateAppealService: UpdateAppealService) {
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
      resetJourneyValues(req.session.appeal.application);
      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      req.session.appeal.application.feeSupportPersisted = true;
      await persistAppeal(req.session.appeal, refundFeatureEnabled);
      const defaultRedirect = paths.appealStarted.taskList;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupFeeWaiverRefundController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.feeWaiverRefund, middleware, getFeeWaiver);
  router.post(paths.appealSubmitted.feeWaiverRefund, middleware, postFeeWaiver(updateAppealService));
  return router;
}

// Function used in CYA page edit mode, when the start page option is changed other values should be reset and the journey should start from the new selected option
function resetJourneyValues(application: AppealApplication) {
  application.asylumSupportRefNumber = null;
  application.helpWithFeesOption = null;
  application.helpWithFeesRefNumber = null;
  application.localAuthorityLetters = null;
}

export {
  getFeeWaiver,
  postFeeWaiver,
  setupFeeWaiverRefundController,
  resetJourneyValues
};
