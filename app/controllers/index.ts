import { Router, Request, Response } from 'express';
import { paths } from '../paths';

function getIndex(req: Request, res: Response) {
  res.render('index.html', { data: 'Hello from the OTHER world!!!' });
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
