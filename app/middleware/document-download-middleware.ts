import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { Application } from 'express';

import { proxyList } from './proxy-list';

const log = Logger.getLogger('document-download');
const proxy = require('express-http-proxy');

export class DocumentDownloadMiddleware {
  public enableFor(app: Application): void {
    for (const downloadProxy of proxyList) {
      app.use(
                log.info('Entered the documentdownloadmiddleware class for request'),
                downloadProxy.endpoint,
                proxy(config.get('cdamDocumentManagement.apiUrl'), {
                  proxyReqPathResolver: downloadProxy.path,
                  // proxyReqOptDecorator: this.addCdamHeaders,
                  secure: false,
                  changeOrigin: true,
                  proxyErrorHandler: (err, res, next) => {
                    if (err instanceof UserNotLoggedInError) {
                      return res.redirect('/login');
                    } else if (err.status === 401) {
                      return res.redirect(); // TODO: define path to redirect to
                    } else if (err.code === 'ECONNRESET') {
                      log.info('Connection reset by peer. URL: ' + res.req.path);
                      return res.redirect(); // TODO: define path to redirect to
                    }
                    next(err);
                  }
                })
            );
    }
  }

// addCdamHeaders(
//     proxyReqOpts: { headers: Record<string, unknown> },
//     req: Request
// ): { headers: Record<string, unknown> } {
//     if (!req.session.user) {
//         throw new UserNotLoggedInError();
//     }
//
//     proxyReqOpts.headers['ServiceAuthorization'] = this.authenticationService.getSecurityHeaders(req);
//     proxyReqOpts.headers['Authorization'] = `Bearer ${req.session.user.accessToken}`;
//     proxyReqOpts.headers['user-roles'] = 'citizen';
//     return proxyReqOpts;
// }
}

class UserNotLoggedInError extends Error {
  constructor() {
    super('Error downloading document. User not logged in.');
  }
}
