import { NextFunction, Router, Request, Response } from 'express';
import Logger from '../utils/logger';

const logLabel: string = 'controllers/index.js';

function getIndex(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    logger.trace('getIndex', logLabel);
    res.render('index.html', { data: 'Hello from the OTHER world!!!' });
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function setupIndexController(deps?: any): Router {
  const router = Router();
  router.get('/', getIndex);
  return router;
}

export {
  setupIndexController,
  getIndex
};
