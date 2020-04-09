import idamExpressMiddleware from '@hmcts/ia-idam-express-middleware';
import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { idamConfig } from '../config/idam-config';
import { checkSession } from '../middleware/session-middleware';
import { paths } from '../paths';

function getExtendSession(req: Request, res: Response, next: NextFunction) {
  const timeout = moment().add(config.get('session.cookie.maxAgeInMs'), 'milliseconds');
  return res.send({ timeout });
}

function getSessionEnded(req: Request, res: Response, next: NextFunction) {
  res.locals.authenticated = false;
  return res.render('session/session-ended.njk');
}

function setupSessionController() {
  const router = Router();
  router.get(paths.session.extendSession, idamExpressMiddleware.protect(idamConfig), checkSession(idamConfig), getExtendSession);
  router.get(paths.session.sessionExpired, idamExpressMiddleware.logout(idamConfig), getSessionEnded);
  return router;
}

export {
  getExtendSession,
  getSessionEnded,
  setupSessionController
};
