import { NextFunction, Response, Router } from 'express';
import { Request } from '../domain/request';
import { paths } from '../paths';
import Logger from '../utils/logger';

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

/* istanbul ignore next */
function setupIndexController(deps?: any): Router {
  const router = Router();
  router.get(paths.index, getIndex);
  return router;
}

export {
  setupIndexController,
  getIndex
};
