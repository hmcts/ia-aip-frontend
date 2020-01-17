import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getStart(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.eligibility = {};
    res.render('start.njk');
  } catch (e) {
    next(e);
  }
}

function setupStartController(): Router {
  const router = Router();
  router.get(paths.start, getStart);
  return router;
}

export {
  getStart,
  setupStartController
};
