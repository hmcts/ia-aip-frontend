import { NextFunction, Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import Logger, { getLogLabel } from '../utils/logger';

const logLabel: string = getLogLabel(__filename);
/**
 * Page not found errors (404) with content negotiation that returns a html page when supported or error as json or text if unsupported
 */
function pageNotFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(NOT_FOUND);
  res.render('errors/404.njk');
}

/**
 * Handle Server errors (500) with content negotiation that returns a html page when supported or error as json or text if unsupported
 */
function serverErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  logger.exception(err, logLabel);

  res.status(INTERNAL_SERVER_ERROR);
  res.render('errors/500.njk', { err });
}

export { pageNotFoundHandler, serverErrorHandler };
