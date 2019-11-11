import { NextFunction, Request, Response } from 'express';
import Logger from '../utils/logger';

function initSession(req: Request, res: Response, next: NextFunction) {
  // TODO: CCD Integration
  if (!req.session.appeal) {
    const logger: Logger = req.app.locals.logger;
    logger.trace('Initializing session', 'initSession');
    req.session.appeal = {
      application: {
        homeOfficeRefNumber: null,
        appealType: null,
        contactDetails: {},
        dateLetterSent: null,
        isAppealLate: false,
        lateAppeal: {},
        personalDetails: null
      },
      caseBuilding: {},
      hearingRequirements: {}
    };
  }
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
