import { NextFunction, Request, Response } from 'express';

async function outOfCountryFeatureMiddleware(req: Request, res: Response, next: NextFunction) {
  return next();
}

export {
  outOfCountryFeatureMiddleware
};
