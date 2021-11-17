import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { hearingRequirementsMiddleware } from '../../middleware/hearing-requirements-middleware';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { getTaskList } from './task-list';

function setupHearingRequirementsAccessNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.taskList, middleware,hearingRequirementsMiddleware, getTaskList);
  // Supply all the pages that requires access control such as witnesses, access needs, other needs and dates to avoid  pages
  return router;
}

export {
  setupHearingRequirementsAccessNeedsController
};
