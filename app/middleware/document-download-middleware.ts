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
                downloadProxy.endpoints,
                proxy(config.get('CASE_DOCUMENT_AM_URL'), {
                  proxyReqPathResolver: downloadProxy.path,
                  // proxyReqOptDecorator: this.addCdamHeaders,
                  secure: false,
                  changeOrigin: true,
                  proxyErrorHandler: (err, res, next) => {
                    if (err instanceof UserNotLoggedInError) {
                      return res.redirect(); // TIMED_OUT_URL to be defined later
                    } else if (err.status === 401) {
                      return res.redirect(); // TIMED_OUT_URL to be defined later
                    } else if (err.code === 'ECONNRESET') {
                      log.info('Connection reset by peer. URL: ' + res.req.path);
                      return res.redirect(); // TIMED_OUT_URL to be defined later
                    }
                    next(err);
                  }
                })
            );
    }
  }

    // addCdamHeaders(
    //     proxyReqOpts: { headers: Record<string, unknown> },
    //     userReq: Request
    // ): { headers: Record<string, unknown> } {
    //     if (!userReq.session.user) {
    //         throw new UserNotLoggedInError();
    //     }
    //
    //     proxyReqOpts.headers['ServiceAuthorization'] = getServiceAuthToken();
    //     proxyReqOpts.headers['Authorization'] = `Bearer ${userReq.session.user.accessToken}`;
    //     proxyReqOpts.headers['user-roles'] = userReq.session.user.roles.join(',');
    //     return proxyReqOpts;
    // }
}

class UserNotLoggedInError extends Error {
  constructor() {
    super('Error downloading document. User not logged in.');
  }
}
