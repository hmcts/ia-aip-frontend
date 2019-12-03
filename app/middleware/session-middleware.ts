import { NextFunction, Request, Response } from 'express';
import { CcdService } from '../service/ccd-service';
import IdamService from '../service/idam-service';
import S2SService from '../service/s2s-service';
import UpdateAppealService from '../service/update-appeal-service';
import Logger from '../utils/logger';
import { appealApplicationStatus } from '../utils/tasks-utils';

const updateAppealService = new UpdateAppealService(new CcdService(), new IdamService(), S2SService.getInstance());

async function initSession(req: Request, res: Response, next: NextFunction) {
  try {
    await updateAppealService.loadAppeal(req);
    req.session.appeal.application.tasks = appealApplicationStatus(req.session.appeal);
    next();
  } catch (e) {
    next(e);
  }
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
  initSession,
  logSession
};
