import { NextFunction, Request, Response } from 'express';
import { CcdService } from '../service/ccd-service';
import IdamService from '../service/idam-service';
import S2SService from '../service/s2s-service';
import UpdateAppealService from '../service/update-appeal-service';
import Logger from '../utils/logger';

const updateAppealService = new UpdateAppealService(new CcdService(), new IdamService(), S2SService.getInstance());

async function initSession(req: Request, res: Response, next: NextFunction) {
  await updateAppealService.loadAppeal(req);
  next();
}

function logSession(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  logger.request(JSON.stringify(req.session, null, 2), 'logSession');
  next();
}

export {
  initSession,
  logSession
};
