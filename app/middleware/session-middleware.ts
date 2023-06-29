import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { Events } from '../data/events';
import { paths } from '../paths';
import { AuthenticationService } from '../service/authentication-service';
import { CcdService } from '../service/ccd-service';
import CcdSystemService from '../service/ccd-system-service';
import { DocumentManagementService } from './service/document-management-service';
import IdamService from '../service/idam-service';
import S2SService from '../service/s2s-service';
import { SystemAuthenticationService } from '../service/system-authentication-service';
import UpdateAppealService from '../service/update-appeal-service';
import Logger from '../utils/logger';

const idamService = new IdamService();
const authenticationService: AuthenticationService = new AuthenticationService(idamService, S2SService.getInstance());
const documentManagementService: DocumentManagementService = new DocumentManagementService(authenticationService);
const updateAppealService: UpdateAppealService = new UpdateAppealService(new CcdService(), authenticationService, S2SService.getInstance(), documentManagementService);
const ccdSystemService: CcdSystemService = new CcdSystemService(new SystemAuthenticationService(), S2SService.getInstance());

const PIN_USED_UPDATE = {
  appellantPinInPost: {
    pinUsed: 'Yes'
  }
};

async function startRepresentingYourself(req: Request, res: Response, next: NextFunction) {
  if (req.session.startRepresentingYourself === undefined) {
    return next();
  }

  if (!req.session.startRepresentingYourself.accessValidated) {
    return res.redirect(paths.startRepresentingYourself.start);
  }

  if (!req.session.startRepresentingYourself.detailsConfirmed) {
    return res.redirect(paths.startRepresentingYourself.confirmDetails);
  }

  try {
    const caseId = req.session.startRepresentingYourself.id;
    await ccdSystemService.givenAppellantAccess(caseId, req.idam.userDetails.uid);
    const appeal: Appeal = await updateAppealService.submitSimpleEvent(Events.PIP_ACTIVATION, caseId,
      PIN_USED_UPDATE, req.idam.userDetails.uid, idamService.getUserToken(req));
    req.session.ccdCaseId = caseId;
    req.session.appeal = appeal;
    req.session.startRepresentingYourself = undefined;
    res.redirect(paths.common.overview);
  } catch (e) {
    next(e);
  }
}

async function initSession(req: Request, res: Response, next: NextFunction) {
  try {
    await updateAppealService.loadAppeal(req);
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
      res.redirect(paths.common.login);
    } else {
      next();
    }
  };
}

/**
 * Used to ignore values from printing cleaning up noise
 */
function replacer(key, value) {
  switch (key) {
    case 'history':
    case 'data':
      return '**OMITTED**';
    default:
      return value;
  }
}

function logSession(req: Request, res: Response, next: NextFunction) {
  try {
    const logger: Logger = req.app.locals.logger;
    logger.request(JSON.stringify(req.session, replacer, 2), 'logSession');
    next();
  } catch (e) {
    next(e);
  }
}

export {
  startRepresentingYourself,
  checkSession,
  initSession,
  logSession
};
