import idamExpressMiddleware from '@hmcts/ia-idam-express-middleware';
import { NextFunction, Request, Response, Router } from 'express';
import { idamConfig } from '../config/idam-config';
import { checkSession, initSession, startRepresentingYourself } from '../middleware/session-middleware';
import { paths } from '../paths';
import { getIdamLoginUrl, getIdamRedirectUrl } from '../utils/url-utils';

function getLogin(req: Request, res: Response, next: NextFunction) {
  try {
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
    const redirectTo = req.session.redirectUrl || paths.common.overview;
    req.session.redirectUrl = undefined;
    res.redirect(redirectTo);
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
  router.get(paths.common.login, authenticateMiddleware, getLogin);
  router.get(paths.common.redirectUrl, idamExpressMiddleware.landingPage(idamConfig), startRepresentingYourself, initSession, getRedirectUrl);
  router.use(idamExpressMiddleware.protect(idamConfig), checkSession(idamConfig));
  router.get(paths.common.logout, idamExpressMiddleware.logout(idamConfig), getLogout);
  return router;
}

export {
  setupIdamController
};
