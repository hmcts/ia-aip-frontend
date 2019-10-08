import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

const label: string = 'LogErrorMiddleware';

function logRequestMiddleware(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  logger.request(`${req.method} ${req.originalUrl}`, label);
  next();
}

function logErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  logger.exception(`${req.method} ${req.originalUrl}. Error ${err.message}`, label);
  next(err);
}

export {
  logErrorMiddleware,
  logRequestMiddleware
};
