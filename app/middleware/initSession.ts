import { NextFunction, Request, Response } from 'express';
import CcdService from '../service/ccd-service';
import { getSecurityHeaders, SecurityHeaders } from '../service/getHeaders';

const ccdService = new CcdService();

// todo need a type for the case data
async function loadCaseFromCcd(req: Request): Promise<any> {
  const securityHeaders: SecurityHeaders = await getSecurityHeaders(req);

  return ccdService.loadOrCreateCase(req.idam.userDetails.id, securityHeaders);
}

async function initSession(req: Request, res: Response, next: NextFunction) {
  await loadCaseFromCcd(req);

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
  initSession,
  loadCaseFromCcd
};
