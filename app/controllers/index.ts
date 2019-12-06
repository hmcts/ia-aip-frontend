import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getIndex(req: Request, res: Response, next: NextFunction) {
  try {
    return res.redirect(paths.start);
  } catch (e) {
    next(e);
  }
}

function setupIndexController(): Router {
  const router = Router();
  router.get(paths.index, getIndex);
  return router;
}

export {
  setupIndexController,
  getIndex
};
