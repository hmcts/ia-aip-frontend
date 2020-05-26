import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { appealApplicationStatus } from '../../utils/tasks-utils';

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

function getAppealStageStatus(status: ApplicationStatus) {
  const yourDetails = buildSectionObject('yourDetails', [ 'homeOfficeDetails', 'personalDetails', 'contactDetails' ], status);
  const appealDetails = buildSectionObject('appealDetails', [ 'typeOfAppeal' ], status);
  const checkAndSend = buildSectionObject('checkAndSend', [ 'checkAndSend' ], status);

  return [
    yourDetails,
    appealDetails,
    checkAndSend
  ];
}

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    const status = appealApplicationStatus(req.session.appeal);
    const statusOverview = getAppealStageStatus(status);
    return res.render('appeal-application/task-list.njk', { data: statusOverview });
  } catch (e) {
    next(e);
  }
}

function setupTaskListController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealStarted.taskList, middleware, getTaskList);
  return router;
}

export {
  setupTaskListController,
  getTaskList
};
