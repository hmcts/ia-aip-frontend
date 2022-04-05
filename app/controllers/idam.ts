import idamExpressMiddleware from '@hmcts/ia-idam-express-middleware';
import { NextFunction, Request, Response, Router } from 'express';
import { idamConfig } from '../config/idam-config';
import { checkSession, initSession } from '../middleware/session-middleware';
import { paths } from '../paths';
import { getIdamLoginUrl, getIdamRedirectUrl } from '../utils/url-utils';

// tslint:disable:no-console
function getLogin(req: Request, res: Response, next: NextFunction) {
  try {
    console.info('======================');
    console.info('Reading Oath2 Proxy');
    console.info(req.cookies['_oauth2_proxy']);
    res.redirect(paths.common.overview);
  } catch (e) {
    next(e);
  }
}

function getLogout(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(paths.common.start);
  } catch (e) {
    next(e);
  }
}

function getRedirectUrl(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(paths.common.overview);
  } catch (e) {
    next(e);
  }
}
// tslint:disable:no-console
function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  idamConfig.redirectUri = getIdamRedirectUrl(req);
  idamConfig.idamLoginUrl = getIdamLoginUrl(req);
  console.info('======================');
  console.info('Reading Oath2 Proxy');
  console.info(req.cookies['_oauth2_proxy']);
  console.info('Reading Response');
  console.info(res);
  console.info('Reading Request');
  console.info(req);
  idamExpressMiddleware.authenticate(idamConfig)(req, res, next);
}

function setupIdamController(): Router {
  const router = Router();
  router.get(paths.common.login, authenticateMiddleware, getLogin);
  router.get(paths.common.redirectUrl, idamExpressMiddleware.landingPage(idamConfig), initSession, getRedirectUrl);
  router.use(idamExpressMiddleware.protect(idamConfig), checkSession(idamConfig));
  router.get(paths.common.logout, idamExpressMiddleware.logout(idamConfig), getLogout);

  return router;
}

export {
  setupIdamController
};
