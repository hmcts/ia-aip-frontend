import { NextFunction, Request, Response } from 'express';

function initSession(req: Request, res: Response, next: NextFunction) {
  // TODO: CCD Integration
  req.session.appeal = {
    application: {
      homeOfficeRefNumber: null,
      appealType: null,
      contactDetails: null,
      dateLetterSent: null,
      isAppealLate: false,
      lateAppeal: null,
      personalDetails: null
    },
    caseBuilding: {},
    hearingRequirements: {}
  };
  next();
}

export {
  initSession
};
