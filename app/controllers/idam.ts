import idamExpressMiddleware from '@hmcts/ia-idam-express-middleware';
import { NextFunction, Request, Response, Router } from 'express';
import { idamConfig } from '../config/idam-config';
import { checkSession, initSession } from '../middleware/session-middleware';
import { paths } from '../paths';
import { getIdamLoginUrl, getIdamRedirectUrl } from '../utils/url-utils';

function getLogin(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(paths.overview);
  } catch (e) {
    next(e);
  }
}

function getLogout(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(paths.start);
  } catch (e) {
    next(e);
  }
}

function getRedirectUrl(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(paths.overview);
  } catch (e) {
    next(e);
  }
}

function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  idamConfig.redirectUri = getIdamRedirectUrl(req);
  idamConfig.idamLoginUrl = getIdamLoginUrl(req);
  idamExpressMiddleware.authenticate(idamConfig)(req, res, next);
}

function setupIdamController(): Router {
  const router = Router();
  router.use(idamExpressMiddleware.userDetails(idamConfig));
  router.get(paths.login, authenticateMiddleware, getLogin);
  router.get(paths.redirectUrl, idamExpressMiddleware.landingPage(idamConfig), initSession, getRedirectUrl);
  router.use(idamExpressMiddleware.protect(idamConfig), checkSession(idamConfig));
  router.get(paths.logout, idamExpressMiddleware.logout(idamConfig), getLogout);

  return router;
}

export {
  setupIdamController
};
