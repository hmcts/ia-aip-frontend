import { Router } from 'express';
import { hearingRequirementsMiddleware } from '../../middleware/hearing-requirements-middleware';
import { paths } from '../../paths';
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
  return router;
}

export {
  setupHearingRequirementsAccessNeedsController
};
