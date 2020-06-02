import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { buildSectionObject, cmaRequirementsStatus } from '../../utils/tasks-utils';

function getCmaRequirementsStatus(status: ApplicationStatus) {
  const accessNeeds = buildSectionObject('accessNeeds', [ 'accessNeeds' ], status);
  const otherNeeds = buildSectionObject('otherNeeds', [ 'otherNeeds' ], status);
  const datesToAvoid = buildSectionObject('datesToAvoid', [ 'datesToAvoid' ], status);
  const checkAndSend = buildSectionObject('checkAndSend', [ 'checkAndSend' ], status);

  return [
    accessNeeds,
    otherNeeds,
    datesToAvoid,
    checkAndSend
  ];
}

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    const status: ApplicationStatus = cmaRequirementsStatus(req.session.appeal);
    const statusOverview = getCmaRequirementsStatus(status);

    return res.render('cma-requirements/task-list.njk', {
      previousPage: paths.common.overview,
      data: statusOverview
    });
  } catch (e) {
    next(e);
  }
}

function setupCmaRequirementsTaskListController(middleware: Middleware[]) {
  const router = Router();
  router.get(paths.cmaRequirements.taskList, middleware, getTaskList);
  return router;
}

export {
  getTaskList,
  setupCmaRequirementsTaskListController
};
