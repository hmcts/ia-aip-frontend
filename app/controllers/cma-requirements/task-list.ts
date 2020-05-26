import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { cmaRequirementsStatus } from '../../utils/tasks-utils';

/**
 * Creates a new Section object and determines the current status of the step using the taskIds provided.
 * @param sectionId the sectionId to construct a new Section Object
 * @param taskIds the taskId under the section used to check for saved status and completion status
 * @param req the request Object containing the session
 */
function buildSectionObject(sectionId: string, taskIds: string[], status: ApplicationStatus) {
  const tasks: Task[] = [];

  function isSaved(taskId: string) {
    return status[taskId].saved;
  }

  function isCompleted(taskId: string) {
    return status[taskId].completed;
  }

  function isActive(taskId: string) {
    return status[taskId].active;
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
