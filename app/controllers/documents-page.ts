import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { paths } from '../paths';
import { DocumentManagementService } from '../service/document-management-service';

function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documentMap = req.session.appeal.documentMap || [];

    const uniqueDocuments = new Map<string, DocumentMap>();

    documentMap.forEach(document => {
      if (!document.documentUploadDate) {
        return;
      }

      if (!uniqueDocuments.has(document.url)) {
        uniqueDocuments.set(document.url, document);
      }
    });

    res.render('documents/documents.njk', {
      title: 'Documents',
      documents: Array.from(uniqueDocuments.values())
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