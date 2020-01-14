import { NextFunction, Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import i18n from '../../locale/en.json';
import Logger, { getLogLabel } from '../utils/logger';

const logLabel: string = getLogLabel(__filename);
/**
 * Page not found errors (404) with content negotiation that returns a html page when supported or error as json or text if unsupported
 */
function pageNotFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(NOT_FOUND);

  const accept = req.headers['accept'];
  const list = accept.split(',');

  if (list.includes('text/html')) {
    res.render('errors/404.njk');
  } else if (list.includes('application/json')) {
    res.send({ error: NOT_FOUND, message: i18n.error.error404.title });
  } else {
    res.type('text');
    res.send(i18n.error.error404.title);
  }
}

/**
 * Handle Server errors (500) with content negotiation that returns a html page when supported or error as json or text if unsupported
 */
function serverErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  logger.exception(err, logLabel);

  res.status(INTERNAL_SERVER_ERROR);

  const accept = req.headers['accept'];
  const list = accept.split(',');

  if (list.includes('text/html')) {
    res.render('errors/500.njk');
  } else if (list.includes('application/json')) {
    res.send({ error: INTERNAL_SERVER_ERROR, message: i18n.error.error500.title });
  } else {
    res.type('text');
    res.send(i18n.error.error500.title);
  }
}

export { pageNotFoundHandler, serverErrorHandler };
