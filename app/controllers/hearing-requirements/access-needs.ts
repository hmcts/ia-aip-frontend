import { Router } from 'express';
import { hearingRequirementsMiddleware } from '../../middleware/hearing-requirements-middleware';
import { paths } from '../../paths';
import { getAddAnotherDateQuestionPage } from './dates-to-avoid/add-another-date';
import { getEnterADatePage, getEnterADatePageWithId } from './dates-to-avoid/enter-a-date';
import { getDatesToAvoidQuestion } from './dates-to-avoid/question';
import { getDatesToAvoidReason, getDatesToAvoidReasonWithId } from './dates-to-avoid/reason';
import { getWitnessesOutsideUkQuestion } from './hearing-outside-uk';
import { getWitnessNamesPage } from './hearing-witness-names';
import { getWitnessesOnHearingQuestion } from './hearing-witnesses';
import { getTaskList } from './task-list';

function setupHearingRequirementsAccessNeedsController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.taskList, middleware, hearingRequirementsMiddleware, getTaskList);
  router.get(paths.submitHearingRequirements.witnesses, middleware, hearingRequirementsMiddleware, getWitnessesOnHearingQuestion);
  router.get(paths.submitHearingRequirements.hearingWitnessNames, middleware, hearingRequirementsMiddleware, getWitnessNamesPage);
  router.get(paths.submitHearingRequirements.witnessOutsideUK, middleware, hearingRequirementsMiddleware, getWitnessesOutsideUkQuestion);
  // Supply all the pages that requires access control such as witnesses, access needs, other needs and dates to avoid  pages
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidQuestion, middleware, hearingRequirementsMiddleware, getDatesToAvoidQuestion);
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate, middleware, hearingRequirementsMiddleware, getEnterADatePage);
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidEnterDateWithId, middleware, hearingRequirementsMiddleware, getEnterADatePageWithId);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidReasons, middleware, hearingRequirementsMiddleware, getDatesToAvoidReason);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidReasonsWithId, middleware, hearingRequirementsMiddleware, getDatesToAvoidReasonWithId);
  router.get(paths.submitHearingRequirements.hearingDateToAvoidNew, middleware, hearingRequirementsMiddleware, getAddAnotherDateQuestionPage);
  return router;
}

export {
  setupHearingRequirementsAccessNeedsController
};
