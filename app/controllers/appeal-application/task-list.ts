import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { appealApplicationStatus, buildSectionObject } from '../../utils/tasks-utils';

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
