import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';

async function getFeeWaiver(req: Request, res: Response, next: NextFunction) {
  try {
    const drlmSetAsideFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!drlmSetAsideFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('appeal-application/fee-support/fee-waiver.njk', {
      previousPage: paths.appealStarted.feeSupport,
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}


function setupFeeWaiverController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.feeWaiver, middleware, getFeeWaiver);
  return router;
}

export {
  setupFeeWaiverController
};
