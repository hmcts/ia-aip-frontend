import { NextFunction, Request, Response, Router } from 'express';
import { applicationStatusUpdate } from '../middleware/session-middleware';
import { paths } from '../paths';

/**
 * Creates a new Section object and determines the current status of the step using the taskIds provided.
 * @param sectionId the sectionId to construct a new Section Object
 * @param taskIds the taskId under the section used to check for saved status and completion status
 * @param req the request Object containing the session
 */
function buildSectionObject(sectionId: string, taskIds: string[], req: Request) {
  const tasks: Task[] = [];

  function isSaved(taskId: string) {
    return req.session.appeal.application.tasks[taskId].saved;
  }

  function isCompleted(taskId: string) {
    return req.session.appeal.application.tasks[taskId].completed;
  }

  function isActive(taskId: string) {
    return req.session.appeal.application.tasks[taskId].active;
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

function getAppealStageStatus(session: Request) {
  const yourDetails = buildSectionObject('yourDetails', [ 'homeOfficeDetails', 'personalDetails', 'contactDetails' ], session);
  const appealDetails = buildSectionObject('appealDetails', [ 'typeOfAppeal' ], session);
  const checkAndSend = buildSectionObject('checkAndSend', [ 'checkAndSend' ], session);

  return [
    yourDetails,
    appealDetails,
    checkAndSend
  ];
}

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    const statusOverview = getAppealStageStatus(req);
    return res.render('appeal-application/task-list.njk', { data: statusOverview });
  } catch (e) {
    next(e);
  }
}

function setupTaskListController(): Router {
  const router = Router();
  router.get(paths.taskList, applicationStatusUpdate, getTaskList);
  return router;
}

export {
  setupTaskListController,
  getTaskList
};
