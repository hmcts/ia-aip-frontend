import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import Logger from '../utils/logger';

function getIndex(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    res.render('index.njk', { data: 'Hello from the OTHER world!!!' });
  } catch (e) {
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
