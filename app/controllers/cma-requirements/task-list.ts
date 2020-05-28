import { NextFunction, Request, Response, Router } from 'express';
import { cmaRequirementsStatusUpdate } from '../../middleware/session-middleware';
import { paths } from '../../paths';

/**
 * Creates a new Section object and determines the current status of the step using the taskIds provided.
 * @param sectionId the sectionId to construct a new Section Object
 * @param taskIds the taskId under the section used to check for saved status and completion status
 * @param req the request Object containing the session
 */
function buildSectionObject(sectionId: string, taskIds: string[], req: Request) {
  const tasks: Task[] = [];

  function isSaved(taskId: string) {
    return req.session.appeal.cmaRequirements.tasks[taskId].saved;
  }

  function isCompleted(taskId: string) {
    return req.session.appeal.cmaRequirements.tasks[taskId].completed;
  }

  function isActive(taskId: string) {
    return req.session.appeal.cmaRequirements.tasks[taskId].active;
  }

  taskIds.forEach((taskId) => {
    const completed: boolean = isCompleted(taskId);
    const saved: boolean = isSaved(taskId);
    const active: boolean = isActive(taskId);
    const task: Task = { id: taskId, saved, completed, active };
    tasks.push(task);
  });

  const section: Section = { sectionId, tasks };
  return section;
}

function getCmaRequirementsStatus(session: Request) {
  const accessNeeds = buildSectionObject('accessNeeds', [ 'accessNeeds' ], session);
  const otherNeeds = buildSectionObject('otherNeeds', [ 'otherNeeds' ], session);
  const datesToAvoid = buildSectionObject('datesToAvoid', [ 'datesToAvoid' ], session);
  const checkAndSend = buildSectionObject('checkAndSend', [ 'checkAndSend' ], session);

  return [
    accessNeeds,
    otherNeeds,
    datesToAvoid,
    checkAndSend
  ];
}

function getTaskList(req: Request, res: Response, next: NextFunction) {

  try {
    const statusOverview = getCmaRequirementsStatus(req);

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
  router.get(paths.awaitingCmaRequirements.taskList, middleware, cmaRequirementsStatusUpdate, getTaskList);
  return router;
}

export {
  getTaskList,
  setupCmaRequirementsTaskListController
};
