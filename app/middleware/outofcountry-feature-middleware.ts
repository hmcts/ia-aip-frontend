import { NextFunction, Request, Response } from 'express';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';

async function outOfCountryFeatureMiddleware(req: Request, res: Response, next: NextFunction) {
  const outOfCountryFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, 'aip-ooc-feature', false);
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
