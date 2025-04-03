import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { DocmosisService } from '../service/docmosis-service';
import { formatDate } from '../utils/date-utils';
import { formatCaseId, toIsoDate } from '../utils/utils';

const docmosis: DocmosisService = new DocmosisService();

function getChangeRepresentation() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.render('change-representation.njk', {
        previousPage: paths.common.overview,
        ...getDetails(req)
      });
    } catch (error) {
      next(error);
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
        return res.send(response.document);
      } else {
        next(response.error);
      }
    } catch (error) {
      next(error);
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
