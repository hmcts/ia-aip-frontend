import config from 'config';
import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import moment from 'moment';
import { idamConfig } from '../config/idam-config';
import idamExpressMiddleware from '../middleware/ia-idam-express-middleware';
import { checkSession } from '../middleware/session-middleware';
import { paths } from '../paths';

function getExtendSession(req: Request<Params>, res: Response, next: NextFunction): void {
  const timeout = moment().add(config.get('session.cookie.maxAgeInMs'), 'milliseconds');
  res.send({ timeout });
}

function getSessionEnded(req: Request<Params>, res: Response, next: NextFunction) {
  res.locals.authenticated = false;
  return res.render('session/session-ended.njk');
}

function setupSessionController() {
  const router = Router();
  router.get(paths.common.extendSession, idamExpressMiddleware.protect(idamConfig), checkSession(idamConfig), getExtendSession);
  router.get(paths.common.sessionExpired, idamExpressMiddleware.logout(idamConfig), getSessionEnded);
  return router;
}

export {
  getExtendSession,
  getSessionEnded,
  setupSessionController
};
