import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import Logger from '../utils/logger';

const logLabel: string = 'controllers/index.ts';

function getIndex(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    logger.trace('getIndex', logLabel);
    res.render('index.njk', { data: 'Hello from the OTHER world!!!' });
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function getTestPage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    const { firstName, lastName } = req.body;
    let variable: boolean = false;
    if (firstName === 'Joe') variable = true;
    const dataObj: Object = {
      data: 'Hello from the Test Router',
      firstName: firstName,
      lastName: lastName,
      variable: variable
    };
    logger.trace('getTestPage', logLabel);
    res.render('test-page.njk', dataObj);
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
