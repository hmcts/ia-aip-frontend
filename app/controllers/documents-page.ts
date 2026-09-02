import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('documents/documents.njk', {
      title: 'Documents',
      documents: []
    });
  } catch (e) {
    next(e);
  }
}

function setupDocumentsController(): Router {
  const router = Router();
  router.get(paths.common.documentsPage, getDocuments);
  return router;
}

export {
  getDocuments,
  setupDocumentsController
};