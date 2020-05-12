import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getFileNotFoundPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('./errors/file-not-found.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  } catch (e) {
    next(e);
  }
}

function setupNotFoundController(): Router {
  const router = Router();
  router.get(paths.common.fileNotFound, getFileNotFoundPage);
  return router;
}

export {
  setupNotFoundController,
  getFileNotFoundPage
};
