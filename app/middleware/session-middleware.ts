import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { paths } from '../paths';
import { AuthenticationService } from '../service/authentication-service';
import { CcdService } from '../service/ccd-service';
import IdamService from '../service/idam-service';
import S2SService from '../service/s2s-service';
import UpdateAppealService from '../service/update-appeal-service';
import Logger from '../utils/logger';
import { appealApplicationStatus } from '../utils/tasks-utils';

const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());

const updateAppealService: UpdateAppealService = new UpdateAppealService(new CcdService(), authenticationService);

async function initSession(req: Request, res: Response, next: NextFunction) {
  try {
    await updateAppealService.loadAppeal(req);
    req.session.appeal.application.tasks = appealApplicationStatus(req.session.appeal);
    next();
  } catch (e) {
    next(e);
  }
}

function checkSession(args: any = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenCookieName = args.tokenCookieName || '__auth-token';
    if (req.cookies && req.cookies[tokenCookieName] && !_.has(req, 'session.appeal.application')) {
      res.clearCookie(tokenCookieName, '/');
      res.redirect(paths.login);
    } else {
      next();
    }
  };
}

function applicationStatusUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.tasks = appealApplicationStatus(req.session.appeal);
    next();
  } catch (e) {
    next(e);
  }
}

function logSession(req: Request, res: Response, next: NextFunction) {
  try {
    const logger: Logger = req.app.locals.logger;
    logger.request(JSON.stringify(req.session, null, 2), 'logSession');
    next();
  } catch (e) {
    next(e);
  }
}

export {
  applicationStatusUpdate,
  checkSession,
  initSession,
  logSession
};
