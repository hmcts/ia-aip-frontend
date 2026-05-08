import { NextFunction, Request, Response } from 'express';
import { FEATURE_FLAGS } from '../data/constants';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';

async function hearingRequirementsMiddleware(req: Request, res: Response, next: NextFunction) {
  return next();
}

async function hearingBundleFeatureMiddleware(req: Request, res: Response, next: NextFunction) {

  return next();
}

export {
  hearingRequirementsMiddleware,
  hearingBundleFeatureMiddleware
};
