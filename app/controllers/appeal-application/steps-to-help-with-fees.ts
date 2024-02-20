import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';

async function getStepsToHelpWithFees(req: Request, res: Response, next: NextFunction) {
  try {
    const drlmSetAsideFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!drlmSetAsideFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/steps-to-help-with-fees.njk', {
      previousPage: paths.appealStarted.helpWithFees,
      saveAndContinueOnly: true
    });
  } catch (error) {
    next(error);
  }
}

function postStepsToHelpWithFees(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function persistAppeal(appeal: Appeal, drlmSetAsideFlag) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], drlmSetAsideFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
      if (!dlrmFeeRemissionFlag) return res.redirect(paths.common.overview);
      if (!shouldValidateWhenSaveForLater(req.body, 'answer')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }

      const isEdit: boolean = req.session.appeal.application.isEdit || false;
      await persistAppeal(req.session.appeal, dlrmFeeRemissionFlag);
      const defaultRedirect = paths.appealStarted.helpWithFeesReferenceNumber;
      let redirectPage = getRedirectPage(isEdit, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupStepToHelpWithFeesController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.stepsToApplyForHelpWithFees, middleware, getStepsToHelpWithFees);
  router.post(paths.appealStarted.stepsToApplyForHelpWithFees, middleware, postStepsToHelpWithFees(updateAppealService));
  return router;
}

export {
  getStepsToHelpWithFees,
  postStepsToHelpWithFees,
  setupStepToHelpWithFeesController
};
