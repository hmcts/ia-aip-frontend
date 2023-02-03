import { NextFunction, Request, Response } from 'express';
import { FEATURE_FLAGS } from '../data/constants';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';

async function hearingRequirementsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.idam && req.idam.userDetails) {
    req.idam.userDetails.uid = req.idam.userDetails.id;
  }
  const hearingRequirementsEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_REQUIREMENTS, false);
  if (hearingRequirementsEnabled) {
    return next();
  } else {
    return res.redirect(paths.common.overview);
  }
}

async function hearingBundleFeatureMiddleware(req: Request, res: Response, next: NextFunction) {
  const hearingBundleFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_BUNDLE, false);
  req.app.locals.logger.trace(`Hearing Bundle Feature Flag =  ${JSON.stringify(hearingBundleFeatureEnabled)}`, 'Hearing Bundle Feature Flag');
  if (hearingBundleFeatureEnabled) {
    return next();
  } else {
    return res.redirect(paths.common.overview);
  }
}

export {
  hearingRequirementsMiddleware,
  hearingBundleFeatureMiddleware
};
