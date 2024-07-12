import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { Application, NextFunction, Request } from 'express';

const log = Logger.getLogger('document-download');
const proxy = require('express-http-proxy');

export class DocumentDownloadMiddleware {

  public enableFor(app: Application): void {
    log.info('Before app.use in DocumentDownloadMiddleware');
    app.use('/downloads', proxy(config.get('documentManagement.apiUrl'), { // any path starting with /downloads proxied
      proxyReqPathResolver: (req: Request): string => {
        log.info('Reached proxyReqPathResolver');
        log.info('Req.path is ' + req.path);
        let documentId = this.extractDocumentIdFromPath(req);
        log.info('The document id is ' + documentId);
        // const documents: DocumentMap[] = req.session.appeal.documentMap;
        // log.info('Documents are ' + documents);
        // const ccdCase = await getCase();
        // const docUrl = ccdCase.field.docUrl;
        return '/documents/' + documentId;
      },
      proxyReqOptDecorator: (proxyReqOpts: any, req: Request) => this.addDmHeaders(proxyReqOpts, req),
      secure: false,
      changeOrigin: true,
      proxyErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof UserNotLoggedInError || err.status === 401 || err.code === 'ECONNRESET') {
          log.info('User not logged in');
        } else if (err.status === 502) {
          log.error(`Bad Gateway: ${err.message}`);
        } else {
          log.error(`Error downloading document: ${err.message}`);
        }
        next(err);
      }
    }));
  }

  private extractDocumentIdFromPath = (req: Request): string => {
    const pathSegments = req.path.split('/');
    const documentIdIndex = 2;
    return pathSegments[documentIdIndex];
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
