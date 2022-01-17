import { NextFunction, Request, Response } from 'express';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';

async function hearingRequirementsMiddleware(req: Request, res: Response, next: NextFunction) {
  const hearingRequirementsEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, 'aip-hearing-requirements-feature', false);
  if (hearingRequirementsEnabled) {
    return next();
  } else {
    return res.redirect(paths.common.overview);
  }
}

async function hearingBundleFeatureMiddleware(req: Request, res: Response, next: NextFunction) {
  const hearingBundleFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, 'aip-hearing-bundle-feature', false);
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
