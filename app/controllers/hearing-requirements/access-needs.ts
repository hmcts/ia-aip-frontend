import { Router } from 'express';
import { hearingRequirementsMiddleware } from '../../middleware/hearing-requirements-middleware';
import { paths } from '../../paths';
import { getWitnessesOutsideUkQuestion } from './hearing-outside-uk';
import { getWitnessNamesPage } from './hearing-witness-names';
import { getWitnessesOnHearingQuestion } from './hearing-witnesses';
import { getHearingAnythingElseQuestion } from './other-needs/anything-else-question';
import { getHearingHealthConditionsQuestion } from './other-needs/health-conditions-question';
import { getJoinHearingByVideoCallQuestion } from './other-needs/joinby-video-call-question';
import { getHearingMultimediaEvidenceQuestion } from './other-needs/multimedia-evidence-question';
import { getHearingPastExperiencesQuestion } from './other-needs/past-experiences-question';
import { getPrivateHearingQuestion } from './other-needs/private-hearing-question';
import { getSingleSexHearingQuestion } from './other-needs/single-sex-hearing-question';
import { getHearingRequirementsStartPage } from './other-needs/start-page';
import { getTaskList } from './task-list';

function setupHearingRequirementsAccessNeedsController(middleware: Middleware[]): Router {
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

  return router;
}

export {
  setupHearingRequirementsAccessNeedsController
};
