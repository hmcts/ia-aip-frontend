import idamExpressMiddleware from '@hmcts/ia-idam-express-middleware';
import { NextFunction, Request, Response, Router } from 'express';
import { idamConfig } from '../config/idam-config';
import { checkSession, initSession } from '../middleware/session-middleware';
import { paths } from '../paths';
import { getIdamLoginUrl, getIdamRedirectUrl } from '../utils/url-utils';

// tslint:disable:no-console
function getLogin(req: Request, res: Response, next: NextFunction) {
  try {
    console.info('getLogin');
    res.redirect(paths.common.overview);
  } catch (e) {
    next(e);
  }
}

function getLogout(req: Request, res: Response, next: NextFunction) {
  try {
    console.info('getLogout');
    res.redirect(paths.common.start);
  } catch (e) {
    next(e);
  }
}

function getRedirectUrl(req: Request, res: Response, next: NextFunction) {
  try {
    console.info('getRedirectUrl');
    console.info(req.cookies);
    res.cookie('_oauth2_proxy', req.cookies['_oauth2_proxy'], { sameSite: 'none', secure: true });
    res.cookie('__auth-token', req.cookies['__auth-token'], { sameSite: 'none', secure: true });
    res.cookie('_oauth2_proxy_csrf', req.cookies['_oauth2_proxy_csrf'], { sameSite: 'none', secure: true });
    res.redirect(paths.common.overview);
  } catch (e) {
    next(e);
  }
}
// tslint:disable:no-console
function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  idamConfig.redirectUri = getIdamRedirectUrl(req);
  idamConfig.idamLoginUrl = getIdamLoginUrl(req);
  console.info('authenticateMiddleware');
  console.info(req.cookies);
  res.cookie('_oauth2_proxy', req.cookies['_oauth2_proxy'], { sameSite: 'none', secure: true });
  res.cookie('__auth-token', req.cookies['__auth-token'], { sameSite: 'none', secure: true });
  res.cookie('_oauth2_proxy_csrf', req.cookies['_oauth2_proxy_csrf'], { sameSite: 'none', secure: true });
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
