import { NextFunction, Request, Response, Router } from 'express';
import { Section, Task } from '../domain/section';
import { paths } from '../paths';

/**
 * Creates a new Section object and determines the current status of the step using the taskIds provided.
 * @param sectionId the sectionId to construct a new Section Object
 * @param taskIds the taskId under the section used to check for saved status and completion status
 * @param req the request Object containing the session
 * @param ccdResponse the ccdResponse
 */
function buildSectionObject(sectionId: string, taskIds: string[], req: Request, ccdResponse: any) {
  const tasks = [];

  // Checks inside the session to see if the data exists in the session
  function isSaved(taskId: string) {
    return req.session.hasOwnProperty(taskId);
  }

  // Checks inside the ccdResponse to see if the data exists.
  function isComplete(taskId: string) {
    return ccdResponse.hasOwnProperty(taskId);
  }

  taskIds.forEach((taskId) => {
    const complete: boolean = isComplete(taskId);
    const saved: boolean = isSaved(taskId);
    const task = new Task({ id: taskId, saved, complete }).data;
    tasks.push(task);
  });

  return new Section(
    {
      sectionId: sectionId,
      tasks
    }).data;
}

function getAppealStageStatus(session: Request, ccdResponse: any) {
  const yourDetails = buildSectionObject('yourDetails', [ 'homeOfficeDetails', 'personalDetails', 'contactDetails' ], session, ccdResponse);
  const appealDetails = buildSectionObject('appealDetails', [ 'typeOfAppeal' ], session, ccdResponse);
  const checkAndSend = buildSectionObject('checkAndSend', [ 'checkAndSend' ], session, ccdResponse);

  return [
    yourDetails,
    appealDetails,
    checkAndSend
  ];
}

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: call CCD to get section statuses and remove mockSectionData
    const ccdResponse = [];
    const statusOverview = getAppealStageStatus(req, ccdResponse);
    res.render('task-list.njk', { data: statusOverview });
  } catch (e) {
    next(e);
  }
}

function setupTaskListController(): Router {
  const router = Router();
  router.get(paths.taskList, getTaskList);
  return router;
}

export {
  setupTaskListController,
  getTaskList
};
