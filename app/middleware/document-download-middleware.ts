import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { Application } from 'express';

import { proxyList } from './proxy-list';

const log = Logger.getLogger('document-download');
const proxy = require('express-http-proxy');

export class DocumentDownloadMiddleware {
  public enableFor(app: Application): void {
    log.info('Before app.use in DocumentDownloadMiddleware');
    app.use(
         (req, res, next) => {
           log.info(
                    'Entering DocumentDownloadMiddleware with proxy endpoint ' +
                    proxyList.endpoint(req) + ' and proxy path ' + proxyList.path(req)
                );
           log.info(
                    `DocumentDownloadMiddleware Request URL: ${req.url}, Headers: ${JSON.stringify(req.headers)}`
                );
           next();
         },
            proxy(config.get('cdamDocumentManagement.apiUrl'), {
              proxyReqPathResolver: (req) => proxyList.path(req),
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
