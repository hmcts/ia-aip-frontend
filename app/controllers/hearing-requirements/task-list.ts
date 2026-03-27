import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { buildSectionObject, submitHearingRequirementsStatus } from '../../utils/tasks-utils';

function getSubmitHearingRequirementsStatus(status: ApplicationStatus, hasNonLegalRep: boolean) {
  const witnesses = buildSectionObject('witnesses', [ 'witnesses' ], status);
  const accessNeeds = buildSectionObject('accessNeeds', [ 'accessNeeds' ], status);
  const nlrList = status.nlrNeeds ? [ 'nlrAttending', 'nlrNeeds' ] : [ 'nlrAttending' ];
  const nlrNeeds = buildSectionObject('nlrNeeds', nlrList, status);
  const otherNeeds = buildSectionObject('otherNeeds', [ 'otherNeeds' ], status);
  const datesToAvoid = buildSectionObject('datesToAvoid', [ 'datesToAvoid' ], status);
  const checkAndSend = buildSectionObject('checkAndSend', [ 'checkAndSend' ], status);
  const sections = [
    witnesses,
    accessNeeds
  ];
  if (hasNonLegalRep) sections.push(nlrNeeds);
  sections.push(otherNeeds, datesToAvoid, checkAndSend);
  return sections;
}

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    const hasNonLegalRep = req.session.appeal?.application?.hasNonLegalRep === 'Yes';
    const status: ApplicationStatus = submitHearingRequirementsStatus(req.session.appeal, hasNonLegalRep);
    const statusOverview = getSubmitHearingRequirementsStatus(status, hasNonLegalRep);

    return res.render('hearing-requirements/task-list.njk', {
      previousPage: paths.common.overview,
      data: statusOverview
    });
  } catch (e) {
    next(e);
  }
}

function setupSubmitHearingRequirementsTaskListController(middleware: Middleware[]) {
  const router = Router();
  router.get(paths.submitHearingRequirements.taskList, middleware, getTaskList);
  return router;
}

export {
  getTaskList,
  setupSubmitHearingRequirementsTaskListController
};
