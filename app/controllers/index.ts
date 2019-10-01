import { Router, Request, Response } from 'express';

function getIndex(req: Request, res: Response) {
  res.render('index.html', { data: 'Hello from the OTHER world!!!' });
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
