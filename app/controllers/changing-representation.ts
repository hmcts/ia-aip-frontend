import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { DocmosisService } from '../service/docmosis-service';
import { formatDate } from '../utils/date-utils';
import { toIsoDate } from '../utils/utils';

const docmosis: DocmosisService = new DocmosisService();

function getChangeRepresentation() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.render('change-representation.njk', getDetails(req));
    } catch (e) {
      next(e);
    }
  };
}

function getChangeRepresentationDownload() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await docmosis.render('noticeOfChangeDetails', getDetails(req));
      if (response.success) {
        res.setHeader('content-type', 'application/pdf');
        res.setHeader('content-disposition', 'attachment; filename="Notice of Change details.pdf"');
        res.send(response.document);
      } else {
        next(response.error);
      }
    } catch (e) {
      next(e);
    }
  };
}

function getDetails(req: Request) {
  return {
    onlineCaseReferenceNumber: formatCaseId(req.session.appeal.ccdCaseId),
    appellantGivenNames: req.session.appeal.application.personalDetails.givenNames,
    appellantFamilyName: req.session.appeal.application.personalDetails.familyName,
    appellantDateOfBirth: formatDate(toIsoDate(req.session.appeal.application.personalDetails.dob))
  };
}

function formatCaseId(caseId: any) {
  let caseStr = new String(caseId);
  if (caseStr.length === 16) {
    caseStr = caseStr.substring(0,4) + '-' + caseStr.substring(4,8) + '-' + caseStr.substring(8,12) + '-' + caseStr.substring(12,16);
  }
  return caseStr;
}

function setupChangeRepresentationControllers(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.changeRepresentation, middleware, getChangeRepresentation());
  router.get(paths.common.changeRepresentationDownload, middleware, getChangeRepresentationDownload());
  return router;
}

export {
  getChangeRepresentation,
  getChangeRepresentationDownload,
  setupChangeRepresentationControllers
};
