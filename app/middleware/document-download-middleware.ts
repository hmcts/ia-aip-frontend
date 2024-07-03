import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { Application } from 'express';

const log = Logger.getLogger('document-download');
const proxy = require('express-http-proxy');

export class DocumentDownloadMiddleware {
  public enableFor(app: Application): void {
    log.info('Before app.use in DocumentDownloadMiddleware');
    app.use(
            proxy(config.get('cdamDocumentManagement.apiUrl'), {
              proxyReqPathResolver: (req) => {
                if (req.params && req.params.documentId) {
                  const documentPath = `/view/document/${req.params.documentId}`;
                  log.info(`Proxy request path resolved: ${documentPath}`);
                  return documentPath;
                } else {
                  log.error('documentId parameter is not present in the request');
                  return '';
                }
              },
                // proxyReqOptDecorator: this.addCdamHeaders,
              secure: false,
              changeOrigin: true,
              proxyErrorHandler: (err, res, next) => {
                if (err instanceof UserNotLoggedInError) {
                  return res.redirect('/login');
                } else if (err.status === 401) {
                  return res.redirect('/login'); // TODO: define path to redirect to
                } else if (err.code === 'ECONNRESET') {
                  log.info('Connection reset by peer. URL: ' + res.req.path);
                  return res.redirect('/login'); // TODO: define path to redirect to
                }
                next(err);
              }
            })
        );
  }
}

class UserNotLoggedInError extends Error {
  constructor() {
    super('Error downloading document. User not logged in.');
  }
}

// Uncomment and implement addCdamHeaders if needed
// addCdamHeaders(
//     proxyReqOpts: { headers: Record<string, unknown> },
//     req: Request
// ): { headers: Record<string, unknown> } {
//     if (!req.session.user) {
//
