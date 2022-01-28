import { Router } from 'express';
import { hearingBundleFeatureMiddleware, hearingRequirementsMiddleware } from '../../middleware/hearing-requirements-middleware';
import { paths } from '../../paths';
import { getDecisionAndReasonsViewer, getHearingNoticeViewer } from '../detail-viewers';
import { getCheckAndSendPage } from './check-and-send';
import { getHearingRequirementsConfirmationPage } from './confirmation-page';
import { getAddAnotherDateQuestionPage } from './dates-to-avoid/add-another-date';
import { getEnterADatePage, getEnterADatePageWithId } from './dates-to-avoid/enter-a-date';
import { getDatesToAvoidQuestion } from './dates-to-avoid/question';
import { getDatesToAvoidReason, getDatesToAvoidReasonWithId } from './dates-to-avoid/reason';
import { getWitnessesOutsideUkQuestion } from './hearing-outside-uk';
import { getWitnessNamesPage } from './hearing-witness-names';
import { getWitnessesOnHearingQuestion } from './hearing-witnesses';
import { getHearingAnythingElseQuestion } from './other-needs/anything-else-question';
import { getHearingAnythingElseReason } from './other-needs/anything-else-reason';
import { getHearingMultimediaEquipmentQuestion } from './other-needs/bring-equipment-question';
import { getHearingMultimediaEquipmentReason } from './other-needs/bring-equipment-reason';
import { getHearingHealthConditionsQuestion } from './other-needs/health-conditions-question';
import { getHearingHealthConditionsReason } from './other-needs/health-conditions-reason';
import { getJoinHearingByVideoCallQuestion } from './other-needs/joinby-video-call-question';
import { getJoinByVideoCallReason } from './other-needs/joinby-video-call-reason';
import { getHearingMultimediaEvidenceQuestion } from './other-needs/multimedia-evidence-question';
import { getHearingPastExperiencesQuestion } from './other-needs/past-experiences-question';
import { getHearingPastExperiencesReason } from './other-needs/past-experiences-reason';
import { getPrivateHearingQuestion } from './other-needs/private-hearing-question';
import { getPrivateHearingReason } from './other-needs/private-hearing-reason';
import { getSingleSexHearingAllFemaleReason } from './other-needs/single-sex-hearing-all-female-reason';
import { getSingleSexHearingAllMaleReason } from './other-needs/single-sex-hearing-all-male-reason';
import { getSingleSexHearingQuestion } from './other-needs/single-sex-hearing-question';
import { getSingleSexTypeHearingQuestion } from './other-needs/single-sex-type-hearing-question';
import { getHearingRequirementsStartPage } from './other-needs/start-page';
import { getTaskList } from './task-list';
import { getYourHearingNeedsPage } from './your-hearing-needs';

function setupHearingRequirementsFeatureToggleController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.taskList, middleware, hearingRequirementsMiddleware, getTaskList);
  router.get(paths.submitHearingRequirements.witnesses, middleware, hearingRequirementsMiddleware, getWitnessesOnHearingQuestion);
  router.get(paths.submitHearingRequirements.hearingWitnessNames, middleware, hearingRequirementsMiddleware, getWitnessNamesPage);
  router.get(paths.submitHearingRequirements.witnessOutsideUK, middleware, hearingRequirementsMiddleware, getWitnessesOutsideUkQuestion);

  router.get(paths.submitHearingRequirements.otherNeeds, middleware, hearingRequirementsMiddleware, getHearingRequirementsStartPage);
  router.get(paths.submitHearingRequirements.otherNeedsAnythingElse, middleware, hearingRequirementsMiddleware, getHearingAnythingElseQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsHealthConditions, middleware, hearingRequirementsMiddleware, getHearingHealthConditionsQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion, middleware, hearingRequirementsMiddleware, getHearingMultimediaEvidenceQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsPastExperiences, middleware, hearingRequirementsMiddleware, getHearingPastExperiencesQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion, middleware, hearingRequirementsMiddleware, getPrivateHearingQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion, middleware, hearingRequirementsMiddleware, getSingleSexHearingQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsVideoAppointment, middleware, hearingRequirementsMiddleware, getJoinHearingByVideoCallQuestion);

  router.get(paths.submitHearingRequirements.otherNeedsAnythingElseReasons, middleware, hearingRequirementsMiddleware, getHearingAnythingElseReason);
  router.get(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentQuestion, middleware, hearingRequirementsMiddleware, getHearingMultimediaEquipmentQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentReason, middleware, hearingRequirementsMiddleware, getHearingMultimediaEquipmentReason);
  router.get(paths.submitHearingRequirements.otherNeedsVideoAppointmentReason, middleware, hearingRequirementsMiddleware, getJoinByVideoCallReason);
  router.get(paths.submitHearingRequirements.otherNeedsHealthConditionsReason, middleware, hearingRequirementsMiddleware, getHearingHealthConditionsReason);
  router.get(paths.submitHearingRequirements.otherNeedsPastExperiencesReasons, middleware, hearingRequirementsMiddleware, getHearingPastExperiencesReason);
  router.get(paths.submitHearingRequirements.otherNeedsPrivateHearingReason, middleware, hearingRequirementsMiddleware, getPrivateHearingReason);
  router.get(paths.submitHearingRequirements.otherNeedsSingleSexTypeHearing, middleware, hearingRequirementsMiddleware, getSingleSexTypeHearingQuestion);
  router.get(paths.submitHearingRequirements.otherNeedsAllMaleHearing, middleware, hearingRequirementsMiddleware, getSingleSexHearingAllMaleReason);
  router.get(paths.submitHearingRequirements.otherNeedsAllFemaleHearing, middleware, hearingRequirementsMiddleware, getSingleSexHearingAllFemaleReason);

  router.get(paths.submitHearingRequirements.hearingDatesToAvoidQuestion, middleware, hearingRequirementsMiddleware, getDatesToAvoidQuestion);
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate, middleware, hearingRequirementsMiddleware, getEnterADatePage);
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidEnterDateWithId, middleware, hearingRequirementsMiddleware, getEnterADatePageWithId);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidReasons, middleware, hearingRequirementsMiddleware, getDatesToAvoidReason);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidReasonsWithId, middleware, hearingRequirementsMiddleware, getDatesToAvoidReasonWithId);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidNew, middleware, hearingRequirementsMiddleware, getAddAnotherDateQuestionPage);

  router.get(paths.submitHearingRequirements.checkAndSend, middleware, hearingRequirementsMiddleware, getCheckAndSendPage);
  router.get(paths.submitHearingRequirements.yourHearingNeeds, middleware, hearingRequirementsMiddleware, getYourHearingNeedsPage);
  router.get(paths.submitHearingRequirements.confirmation, middleware, hearingRequirementsMiddleware, getHearingRequirementsConfirmationPage);

  return router;
}

function setupHearingBundleFeatureToggleController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.hearingNoticeViewer,middleware,hearingBundleFeatureMiddleware,getHearingNoticeViewer);
  router.get(paths.common.decisionAndReasonsViewer,middleware,hearingBundleFeatureMiddleware,getDecisionAndReasonsViewer);

  return router;
}

export {
  setupHearingRequirementsFeatureToggleController,
  setupHearingBundleFeatureToggleController
};
