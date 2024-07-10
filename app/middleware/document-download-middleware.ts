import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { Application, Request } from 'express';
import { paths } from '../paths';
// import { AuthenticationService, SecurityHeaders } from '../service/authentication-service';
import { documentIdToDocStoreUrl } from '../utils/utils';

const log = Logger.getLogger('document-download');
const proxy = require('express-http-proxy');

export class DocumentDownloadMiddleware {

  // private authenticationService: AuthenticationService;
  // constructor(authenticationService: AuthenticationService) {
  //   this.authenticationService = authenticationService;
  // }
  public enableFor(app: Application): void {
    log.info('Before app.use in DocumentDownloadMiddleware');

    app.use((req, res, next) => {
      if (req.path.startsWith(paths.common.documentViewer + '/')) {
        return proxy(config.get('documentManagement.apiUrl'), {
          proxyReqPathResolver: (req) => {
            if (req.path) {
              log.info(`Proxy request path: ${req.path}`);
              let documentId;
              if (req.params && req.params.documentId) {
                documentId = req.params.documentId;
              } else {
                log.error('The req params are null or the document id is null');
              }
              const documentLocationUrl: string = documentIdToDocStoreUrl(documentId, req.session.appeal.documentMap);
              log.info('The document Id is ' + documentId);
              log.info('The document location URL is ' + documentLocationUrl);
              return documentLocationUrl;
            } else {
              log.error('Req.path is not defined');
              return '';
            }
          },
          proxyReqOptDecorator: this.addDmHeaders,
          secure: false,
          changeOrigin: true,
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
  private async addDmHeaders(proxyReqOpts: any, req: Request): Promise<any> {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    proxyReqOpts.headers['Authorization'] = req.headers['Authorization'];
    proxyReqOpts.headers['ServiceAuthorization'] = req.headers['ServiceAuthorization'];
    // proxyReqOpts.headers = await this.authenticationService.getSecurityHeaders(req);
    proxyReqOpts.headers['user-id'] = req.idam.userDetails.uid;
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
