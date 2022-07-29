import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { setupAppealRequestControllers } from './appeal-requests/setup-appeal-application-controllers';
import { setupHearingApplicationControllers } from './hearing-requests/setup-hearing-application-controllers';
import { deleteSupportingEvidence, getRequestSent, uploadSupportingEvidence } from './make-application-common';
import { getPath } from './make-application-controllers-helper';

function validate(pathPrefix: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      if (res.locals.errorCode) {
        let redirectUrl = getPath(pathPrefix, _req.session.appeal.makeAnApplicationTypes.value.code);
        return res.redirect(`${redirectUrl}?error=${res.locals.errorCode}`);
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

function setupMakeApplicationControllers(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.makeApplication.provideSupportingEvidenceDeleteFile, middleware, deleteSupportingEvidence(documentManagementService));
  router.get(paths.makeApplication.requestSent, middleware, getRequestSent);
  router.post(paths.makeApplication.provideSupportingEvidenceUploadFile, middleware, validate('provideSupportingEvidence'), uploadSupportingEvidence(documentManagementService));
  router.use(setupAppealRequestControllers(middleware, updateAppealService));
  router.use(setupHearingApplicationControllers(middleware, updateAppealService));
  return router;
}

export {
  setupMakeApplicationControllers,
  validate
};
