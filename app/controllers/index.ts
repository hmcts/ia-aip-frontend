import { NextFunction, Response, Router } from 'express';
import joi from 'joi';
import { Request } from '../domain/request';
import { paths } from '../paths';
import Logger from '../utils/logger';
import { testSchema } from './schema';

const logLabel: string = 'controllers/index.ts';

function getIndex(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    logger.trace('getIndex', logLabel);
    res.render('index.njk', { data: 'Hello from the OTHER world!!!', user: req.idam.userDetails });
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function getTestPage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    const { firstName, lastName } = req.body;
    logger.trace('getTestPage', logLabel);
    const { error, value } = joi.validate({ name: firstName, mobileNumber: mobileNumber }, testSchema);
    if (error) {
      res.render('test-page.njk',{ variable: true, errors: error.details[0].message });
    } else {
      res.render('test-page.njk', { firstName: value.name, mobileNumber: value.mobileNumber });
    }
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

/* istanbul ignore next */
function setupIndexController(deps?: any): Router {
  const router = Router();
  router.get(paths.index, getIndex);
  router.post(paths.testPost, getTestPage);
  return router;
}

export {
  setupIndexController,
  getIndex
};
