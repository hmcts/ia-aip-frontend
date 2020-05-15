import config from 'config';
import { NextFunction, Request, Response } from 'express';
import { asBooleanValue } from '../utils/utils';

const features = config.get('features');

function featureFlagMiddleware(req: Request, res: Response, next: NextFunction) {
  const featuresEnabled = {};
  Object.keys(features).forEach(function(featureName) {
    featuresEnabled[featureName] = asBooleanValue(features[featureName]);
  });
  res.locals.featuresEnabled = featuresEnabled;
  next();
}

export {
  featureFlagMiddleware
};
