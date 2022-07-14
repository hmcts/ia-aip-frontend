import { Router } from 'express';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getProvideSupportingEvidence, getProvideSupportingEvidenceCheckAndSend, getProvideSupportingEvidenceYesOrNo, postProvideSupportingEvidence, postProvideSupportingEvidenceCheckAndSend, postProvideSupportingEvidenceYesOrNo } from '../make-application-common';
import { validate } from '../setup-application-controllers';
import { getWithdrawAppealApplication, postWithdrawAppealApplication } from './withdraw-appeal-application';

function setupAppealRequestControllers(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.makeApplication.withdraw, middleware, getWithdrawAppealApplication);
  router.get(paths.makeApplication.supportingEvidenceWithdraw, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceWithdraw, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerWithdraw, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.withdraw, middleware, postWithdrawAppealApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceWithdraw, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceWithdraw, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerWithdraw, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  return router;
}

export {
  setupAppealRequestControllers
}

