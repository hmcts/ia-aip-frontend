import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import * as path from 'path';
import { serverErrorHandler } from '../handlers/error-handler';
import { paths } from '../paths';
import { DocumentManagementService, documentMapToDocStoreUrl } from '../service/document-management-service';

/**
 * Takes in a fileName and converts it to the correct display format
 * @param fileName the file name e.g Some_file.pdf
 * @return the formatted name as a string e.g Some_File(PDF)
 */
function fileNameFormatter(fileName: string): string {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const extName = extension.split('.').join('').toUpperCase();
  return `${baseName}(${extName})`;
}

function getDocumentViewer(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const documentId = req.params.documentId;
      const documentLocationUrl: string = documentMapToDocStoreUrl(documentId, req.session.appeal.documentMap);
      if (documentLocationUrl) {
        const response = await documentManagementService.fetchFile(req, documentLocationUrl);
        if (response) {
          res.setHeader('content-type', response.headers['content-type']);
          return res.send(Buffer.from(response.body, 'binary'));
        }
      }
      return serverErrorHandler;

    } catch (error) {
      next(error);
    }
  };
}

function getHoEvidenceDetailsViewer(req: Request, res: Response, next: NextFunction): void {
  try {
    let previousPage: string = paths.overview;
    let documents = [];

    if (_.has(req.session.appeal, 'respondentDocuments')) {
      const respondentDocs = req.session.appeal.respondentDocuments;

      documents = respondentDocs.map(document => {
        const formattedFileName = fileNameFormatter(document.evidence.name);
        const urlHtml = `<a class='govuk-link' target='_blank' href='${paths.detailsViewers.document}/${document.evidence.fileId}'>${formattedFileName}</a>`;
        const formattedDate = moment(document.dateUploaded).format('DD MMMM YYYY');
        return {
          dateUploaded: formattedDate,
          url: urlHtml
        };
      });
    }

    return res.render('detail-viewers/view-ho-details.njk', {
      documents: documents,
      previousPage: previousPage
    });
  } catch (error) {
    next(error);
  }
}

function setupDetailViewersController(documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.detailsViewers.homeOfficeDocuments, getHoEvidenceDetailsViewer);
  router.get(paths.detailsViewers.document + '/:documentId', getDocumentViewer(documentManagementService));
  return router;
}

export {
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  setupDetailViewersController
};
