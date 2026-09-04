import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { DocumentManagementService } from '../service/document-management-service';

function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = req.session.appeal.documentMap || [];

    console.info('DOCUMENT MAP:', JSON.stringify(documents, null, 2));

    res.render('documents/documents.njk', {
      title: 'Documents',
      documents
    });
  } catch (e) {
    next(e);
  }
}

async function getDocument(
    req: Request,
    res: Response,
    next: NextFunction,
    documentManagementService: DocumentManagementService
) {
  try {
    const documents = req.session.appeal.documentMap || [];

    const document = documents.find(
        document => document.id === req.params.documentId
    );

    if (!document) {
      return res.status(404).send('Document not found');
    }

    const response = await documentManagementService.fetchFile(
        req,
        document.url
    );

    res.set({
      'Content-Type': response.headers['content-type']
    });

    res.send(response.data);
  } catch (e) {
    next(e);
  }
}

function setupDocumentsController(
    documentManagementService: DocumentManagementService
): Router {
  const router = Router();

  router.get(paths.common.documentsPage, getDocuments);

  router.get(
      paths.common.documentDownload,
      (req: Request, res: Response, next: NextFunction) =>
          getDocument(req, res, next, documentManagementService)
  );

  return router;
}

export {
  getDocuments,
  getDocument,
  setupDocumentsController
};