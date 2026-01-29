import { NextFunction, Response } from 'express';
import type { Request } from 'express-serve-static-core';
import Logger from '../utils/logger';

const errorMiddlewareLabel: string = 'logErrorMiddleware';
const requestMiddlewareLabel: string = 'logRequestMiddleware';

function logRequestMiddleware(req: Request<Params>, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  logger.request(`[${req.method}] ${req.originalUrl}`, requestMiddlewareLabel);
  next();
}

function logErrorMiddleware(err: any, req: Request<Params>, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  const stack = err.stack ? `\n${err.stack}` : '';
  logger.exception(`[${req.method}] ${req.originalUrl}. Error ${err.message}${stack}`, errorMiddlewareLabel);
  next(err);
}

export {
  logErrorMiddleware,
  logRequestMiddleware
};
