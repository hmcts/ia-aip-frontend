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

export {
  hearingRequirementsMiddleware
};
