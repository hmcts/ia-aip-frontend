import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../paths';

function getIndex(req: Request<Params>, res: Response, next: NextFunction) {
  try {
    return res.redirect(paths.common.start);
  } catch (e) {
    next(e);
  }
}

function setupIndexController(): Router {
  const router = Router();
  router.get(paths.common.index, getIndex);
  return router;
}

export {
  setupIndexController,
  getIndex
};
