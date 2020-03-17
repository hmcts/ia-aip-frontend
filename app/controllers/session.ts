import idamExpressMiddleware from '@hmcts/ia-idam-express-middleware';
import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import { idamConfig } from '../config/idam-config';
import { paths } from '../paths';

function getExtendSession(req: Request, res: Response, next: NextFunction) {
  return res.send({
    timeout: new Date().getTime() + config.get('session.cookie.maxAgeInMs')
  });
}

function getSessionEnded(req: Request, res: Response, next: NextFunction) {
  return res.render('session/session-ended.njk');
}

function setupSessionController() {
  const router = Router();
  router.get(paths.session.extendSession, getExtendSession);
  router.get(paths.session.sessionExpired, idamExpressMiddleware.logout(idamConfig), getSessionEnded);
  return router;
}

export {
  getExtendSession,
  getSessionEnded,
  setupSessionController
};
