import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getForbiddenPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('forbidden/forbidden.njk');
  } catch (e) {
    next(e);
  }
}

function setupForbiddenController(): Router {
  const router = Router();
  router.get(paths.common.forbidden, getForbiddenPage);
  return router;
}

export {
  getForbiddenPage,
  setupForbiddenController
};
