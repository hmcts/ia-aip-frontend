import { Logger } from '@hmcts/nodejs-logging';
import { Request } from 'express';

const log = Logger.getLogger('proxy-list');

export const proxyList: {
  endpoint: (req: Request) => string;
  path: (req: Request) => string;
} = {
  endpoint: (req: Request) => {
    log.info('The request is ' + req);
    return req.params.documentId ? `/downloads/${req.params.documentId}` : '/';
  },
  path: (req: Request): string => {
    const documentId = req.params && req.params.documentId;
    return documentId ? findDocumentAndGetPath(req, req.params.documentId) : '/';
  }
};

const findDocumentAndGetPath = (req: Request, documentId: string): string => {
  log.info('Request is ' + req + ' and params are ' + req.params);
  const documentMap = req.session.appeal && req.session.appeal.documentMap;
  const document = documentMap ? documentMap.find(doc => doc.id === documentId) : undefined;
  if (document) {
    log.info(`Downloading document(url=${document.url})`);
    return document.url;
  } else {
    log.info('Document not found, returning default path');
    return '/';
  }
};
