import { Logger } from '@hmcts/nodejs-logging';
import { Request } from 'express';

const log = Logger.getLogger('proxy-list');

export const proxyList: {
  endpoint: (req: Request) => string;
  path: (req: Request) => string;
}[] = [
  {
    endpoint: (req: Request) => {
      const path = `/downloads/${req.params.documentId}`;
      log.info('The path value is ' + path);
      return path || '/';
    },
    path: (req: Request): string => findDocumentAndGetPath(req, req.params.documentId)
  }

];

const findDocumentAndGetPath = (req: Request, documentId: string): string => {
  log.info('Request is ' + req + ' and params are ' + req.params);
  const documentMap = req.session.appeal && req.session.appeal.documentMap;
  const document = documentMap ? documentMap.find(doc => doc.id === documentId) : undefined;
  if (!document) {
    throw new Error(`Document with id ${documentId} not found`);
  }
  log.info(`Downloading document(url=${document.url})`);
  return document.url;
};
