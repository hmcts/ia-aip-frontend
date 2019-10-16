import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getIndex(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('index.njk', { data:  JSON.stringify(req.session) });
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
