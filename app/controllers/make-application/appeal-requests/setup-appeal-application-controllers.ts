import { Router } from 'express';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { getProvideSupportingEvidence, getProvideSupportingEvidenceCheckAndSend, getProvideSupportingEvidenceYesOrNo, postProvideSupportingEvidence, postProvideSupportingEvidenceCheckAndSend, postProvideSupportingEvidenceYesOrNo } from '../make-application-common';
import { validate } from '../setup-application-controllers';
import { getChangeDetailsApplication, postChangeDetailsApplication } from './change-details-application';
import { getJudgeReviewApplication, postJudgeReviewApplication } from './judge-review-application';
import { getLinkOrUnlinkAppealApplication, postLinkOrUnlinkAppealApplication } from './link-or-unlink-appeal-application';
import { getReinstateAppealApplication, postReinstateAppealApplication } from './reinstate-appeal-application';
import { getOtherAppealApplication, postOtherAppealApplication } from './something-else-application';
import { getWithdrawAppealApplication, postWithdrawAppealApplication } from './withdraw-appeal-application';

function setupAppealRequestControllers(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  /* Withdraw Appeal */
  router.get(paths.makeApplication.withdraw, middleware, getWithdrawAppealApplication);
  router.get(paths.makeApplication.supportingEvidenceWithdraw, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceWithdraw, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerWithdraw, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.withdraw, middleware, postWithdrawAppealApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceWithdraw, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceWithdraw, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerWithdraw, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));

  /* Update Appeal */
  router.get(paths.makeApplication.updateAppealDetails, middleware, getChangeDetailsApplication);
  router.get(paths.makeApplication.supportingEvidenceUpdateAppealDetails, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceUpdateAppealDetails, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerUpdateAppealDetails, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.updateAppealDetails, middleware, postChangeDetailsApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceUpdateAppealDetails, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceUpdateAppealDetails, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerUpdateAppealDetails, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));

  /* Link or Unlink Appeal */
  router.get(paths.makeApplication.linkOrUnlink, middleware, getLinkOrUnlinkAppealApplication);
  router.get(paths.makeApplication.supportingEvidenceLinkOrUnlink, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceLinkOrUnlink, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerLinkOrUnlink, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.linkOrUnlink, middleware, postLinkOrUnlinkAppealApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceLinkOrUnlink, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceLinkOrUnlink, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerLinkOrUnlink, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));

  /* Judge's Review */
  router.get(paths.makeApplication.judgesReview, middleware, getJudgeReviewApplication);
  router.get(paths.makeApplication.supportingEvidenceJudgesReview, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceJudgesReview, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerJudgesReview, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.judgesReview, middleware, postJudgeReviewApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceJudgesReview, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceJudgesReview, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerJudgesReview, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));

  /* Ask Something Else */
  router.get(paths.makeApplication.other, middleware, getOtherAppealApplication);
  router.get(paths.makeApplication.supportingEvidenceOther, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceOther, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerOther, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.other, middleware, postOtherAppealApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceOther, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceOther, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerOther, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));

  /* Reinstate Appeal */
  router.get(paths.makeApplication.reinstate, middleware, getReinstateAppealApplication);
  router.get(paths.makeApplication.supportingEvidenceReinstate, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.provideSupportingEvidenceReinstate, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.checkAnswerReinstate, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.post(paths.makeApplication.reinstate, middleware, postReinstateAppealApplication);
  router.post(paths.makeApplication.provideSupportingEvidenceReinstate, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceReinstate, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.checkAnswerReinstate, middleware, validate('provideSupportingEvidence'), postProvideSupportingEvidenceCheckAndSend(updateAppealService));

  return router;
}

export {
  setupAppealRequestControllers
};
