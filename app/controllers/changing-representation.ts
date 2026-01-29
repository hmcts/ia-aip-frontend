import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../paths';
import { DocmosisService } from '../service/docmosis-service';
import { formatDate } from '../utils/date-utils';
import { formatCaseId, toIsoDate } from '../utils/utils';

const docmosis: DocmosisService = new DocmosisService();

function getChangeRepresentation() {
  return (req: Request<Params>, res: Response, next: NextFunction) => {
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
  return async (req: Request<Params>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await docmosis.render('noticeOfChangeDetails', getDetails(req));
      if (response.success) {
        res.setHeader('content-type', 'application/pdf');
        res.setHeader('content-disposition', 'attachment; filename="Notice of Change details.pdf"');
        res.send(response.document);
      } else {
        next(response.error);
      }
    } catch (error) {
      next(error);
    }
  };
}

function getDetails(req: Request<Params>) {
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
