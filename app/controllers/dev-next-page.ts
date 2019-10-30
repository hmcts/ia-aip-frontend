import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import Logger from '../utils/logger';

const logLabel: string = 'controllers/index.ts';

function getDevNextPage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    logger.trace('getDevNextPage', logLabel);
    return res.render('appeal-application/dev-next-page.njk', { data: JSON.stringify(req.session) });
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

/* istanbul ignore next */
function setupDevNextPageController(deps?: any): Router {
  const router = Router();
  router.get(paths.devNextPage, getDevNextPage);
  return router;
}

export {
  setupDevNextPageController,
  getDevNextPage
};
