import { NextFunction, Request, Response } from 'express';
import { FEATURE_FLAGS } from '../data/constants';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';

async function outOfCountryFeatureMiddleware(req: Request, res: Response, next: NextFunction) {
  const outOfCountryFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.OUT_OF_COUNTRY, false);
  req.app.locals.logger.trace(`Out of Country Feature Flag =  ${JSON.stringify(outOfCountryFeatureEnabled)}`, 'Out of COuntry Feature Flag');
  if (outOfCountryFeatureEnabled) {
    return next();
  } else {
    return res.redirect(paths.common.overview);
  }
}

export {
  outOfCountryFeatureMiddleware
};
