import { NextFunction, Request, Response, Router } from 'express';
import { handleFileUploadErrors, uploadConfiguration } from '../../../middleware/file-upload-validation-middleware';
import { paths } from '../../../paths';
import { DocumentManagementService } from '../../../service/document-management-service';
import UpdateAppealService from '../../../service/update-appeal-service';
import { deleteSupportingEvidence, getProvideSupportingEvidence, getProvideSupportingEvidenceCheckAndSend, getProvideSupportingEvidenceYesOrNo, getRequestSent, postProvideSupportingEvidence, postProvideSupportingEvidenceCheckAndSend, postProvideSupportingEvidenceYesOrNo, uploadSupportingEvidence } from '../make-application-common';
import { getPath } from '../make-application-controllers-helper';
import { getAdjournHearingApplication, postAdjournHearingApplication } from './adjourn-hearing-application';
import { getExpediteHearingApplication, postExpediteHearingApplication } from './expedite-hearing-application';
import { getHearingApplicationType, postHearingApplicationType } from './hearing-application-type';
import { getTransferHearingApplication, postTransferHearingApplication } from './transfer-hearing-application';

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

function setupHearingApplicationControllers(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.makeApplication.askChangeHearing, middleware, getHearingApplicationType);
  router.get(paths.makeApplication.expedite, middleware, getExpediteHearingApplication);
  router.get(paths.makeApplication.adjourn, middleware, getAdjournHearingApplication);
  router.get(paths.makeApplication.transfer, middleware, getTransferHearingApplication);
  router.get(paths.makeApplication.supportingEvidenceExpedite, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.supportingEvidenceAdjourn, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.supportingEvidenceTransfer, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceExpedite, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.provideSupportingEvidenceAdjourn, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.provideSupportingEvidenceTransfer, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.provideSupportingEvidenceDeleteFile, middleware, deleteSupportingEvidence(documentManagementService));
  router.get(paths.makeApplication.checkAnswerExpedite, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.checkAnswerAdjourn, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.checkAnswerTransfer, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.requestSent, middleware, getRequestSent);
  router.post(paths.makeApplication.expedite, middleware, postExpediteHearingApplication);
  router.post(paths.makeApplication.adjourn, middleware, postAdjournHearingApplication);
  router.post(paths.makeApplication.transfer, middleware, postTransferHearingApplication);
  router.post(paths.makeApplication.askChangeHearing, middleware, postHearingApplicationType);
  router.post(paths.makeApplication.provideSupportingEvidenceExpedite, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.provideSupportingEvidenceAdjourn, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.provideSupportingEvidenceTransfer, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceExpedite, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.supportingEvidenceAdjourn, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.supportingEvidenceTransfer, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.provideSupportingEvidenceUploadFile, middleware, validate('provideSupportingEvidence'), uploadSupportingEvidence(documentManagementService));
  router.post(paths.makeApplication.checkAnswerExpedite, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  router.post(paths.makeApplication.checkAnswerAdjourn, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  router.post(paths.makeApplication.checkAnswerTransfer, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  return router;
}

export {
  setupHearingApplicationControllers,
  validate
};
