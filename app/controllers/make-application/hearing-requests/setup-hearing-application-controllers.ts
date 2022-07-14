import {  Router } from 'express';
import { paths } from '../../../paths';
import { DocumentManagementService } from '../../../service/document-management-service';
import UpdateAppealService from '../../../service/update-appeal-service';
import { validate } from "../setup-application-controllers";
import { getProvideSupportingEvidence, getProvideSupportingEvidenceCheckAndSend, getProvideSupportingEvidenceYesOrNo, postProvideSupportingEvidence, postProvideSupportingEvidenceCheckAndSend, postProvideSupportingEvidenceYesOrNo } from '../make-application-common';
import { getAdjournHearingApplication, postAdjournHearingApplication } from './adjourn-hearing-application';
import { getExpediteHearingApplication, postExpediteHearingApplication } from './expedite-hearing-application';
import { getHearingApplicationType, postHearingApplicationType } from './hearing-application-type';
import { getTransferHearingApplication, postTransferHearingApplication } from './transfer-hearing-application';

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
  router.get(paths.makeApplication.checkAnswerExpedite, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.checkAnswerAdjourn, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.checkAnswerTransfer, middleware, getProvideSupportingEvidenceCheckAndSend);
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
  router.post(paths.makeApplication.checkAnswerExpedite, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  router.post(paths.makeApplication.checkAnswerAdjourn, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  router.post(paths.makeApplication.checkAnswerTransfer, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  return router;
}

export {
  setupHearingApplicationControllers,
};
