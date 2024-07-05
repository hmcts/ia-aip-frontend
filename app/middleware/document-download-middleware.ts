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
        return proxy(config.get('documentManagement.apiUrl'), {
          proxyReqPathResolver: (req) => {
            if (req.path) {
              log.info(`Proxy request path: ${req.path}`);
              return req.path;
            } else {
              log.error('Req.path is not defined');
              return '';
            }
          },
          proxyReqOptDecorator: this.addDmHeaders,
          secure: false,
          changeOrigin: true,
          userResHeaderDecorator: (headers, req, res, proxyReq, proxyRes) => {
            log.info(`Response headers from proxied request: ${JSON.stringify(headers)}`);
            return headers;
          },
          userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            log.info(`Response status from proxied request: ${proxyRes.statusCode}`);
            log.info(`Response status from proxied request: ${proxyResData.status}`);
            return proxyResData;
          },
          proxyErrorHandler: (err, _req, res, next) => {
            if (err instanceof UserNotLoggedInError || err.status === 401 || err.code === 'ECONNRESET') {
              return res.redirect('/login');
            } else if (err.status === 502) {
              log.error(`Bad Gateway: ${err.message}`);
            }
            next(err);
          }
        })(req, res, next);
      } else {
        next();
      }
    });
  }
  private addDmHeaders(proxyReqOpts: any, req: Request): any {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    proxyReqOpts.headers['Authorization'] = req.headers['Authorization'];
    proxyReqOpts.headers['ServiceAuthorization'] = req.headers['ServiceAuthorization'];
    // proxyReqOpts.headers['user-id'] = req.idam.userDetails.uid;
    return proxyReqOpts;
  }
}

class UserNotLoggedInError extends Error {
  constructor() {
    super('Error downloading document. User not logged in.');
  }
}

// Implement addCdamHeaders if needed
// addCdamHeaders(
//     proxyReqOpts: { headers: Record<string, unknown> },
//     req: Request
// ): { headers: Record<string, unknown> } {
//     if (!req.session.user) {
//
