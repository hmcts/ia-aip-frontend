import { NextFunction, Request, Response } from 'express';

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
