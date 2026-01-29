import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../paths';

function getStart(req: Request<Params>, res: Response, next: NextFunction) {
  try {
    req.session.eligibility = {};
    res.render('start.njk');
  } catch (e) {
    next(e);
  }
}

function setupStartController(): Router {
  const router = Router();
  router.get(paths.common.start, getStart);
  return router;
}

export {
  getStart,
  setupStartController
};
