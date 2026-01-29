import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../paths';

function getForbiddenPage(req: Request<Params>, res: Response, next: NextFunction) {
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
