import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { Application } from 'express';
import { paths } from '../paths';

const log = Logger.getLogger('document-download');
const proxy = require('express-http-proxy');

export class DocumentDownloadMiddleware {
  public enableFor(app: Application): void {
    log.info('Before app.use in DocumentDownloadMiddleware');

    app.use((req, res, next) => {
      if (req.path.startsWith(paths.common.documentViewer + '/')) {
        return proxy(config.get('cdamDocumentManagement.apiUrl'), {
          proxyReqPathResolver: (req) => {
            if (req.params) {
              log.info(JSON.stringify(req));
            }
            if (req.params && req.params.documentId) {
              const documentPath = `${paths.common.documentViewer}/${req.params.documentId}`;
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
          proxyErrorHandler: (err, _req, res, next) => {
            if (err instanceof UserNotLoggedInError || err.status === 401 || err.code === 'ECONNRESET') {
              return res.redirect('/login');
            }
            next(err);
          }
        })(req, res, next);
      } else {
        next();
      }
    });
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
