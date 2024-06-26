import { Logger } from '@hmcts/nodejs-logging';
import { Request } from 'express';

const log = Logger.getLogger('proxy-list');

export const proxyList: {
  endpoints: (req: Request) => string[];
  path: (req: Request) => string;
}[] = [
  {
    endpoints: (req: Request) => [`/downloads/${req.params.documentId}`],
    path: (req: Request): string => findDocumentAndGetPath(req, req.params.documentId)
  }

];

const findDocumentAndGetPath = (req: Request, documentId: string): string => {
  log.info('Request is ' + req + ' and params are ' + req.params);
  return `/view/document/${documentId}`;
};

// const findDocumentAndGetPath = (req: Request, documentId: string): string => {
//     return getPath(
//         req,
//         req.session.userCase?.documentsGenerated?.find(doc => doc.value.documentId === documentId)?.value
//     );
// };

// const getPath = (req: Request): string => {
//     const path = document?.documentLink.document_binary_url.replace(/.*documents/, '/cases/documents') as string;
//     req.locals.logger.info(`downloading document(url=${path})`);
//     return path;
// };
