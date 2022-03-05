import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { appealApplicationStatus, buildSectionObject } from '../../utils/tasks-utils';

async function getAppealStageStatus(req: Request) {
  const status = appealApplicationStatus(req.session.appeal);
  const paymentsFlag: boolean = await LaunchDarklyService.getInstance().getVariation(req, 'online-card-payments-feature', false);
  const checkAndSendTask = paymentsFlag ? 'checkAndSendWithPayments' : 'checkAndSend';
  const yourDetails = buildSectionObject('yourDetails', [ 'typeOfAppeal', 'homeOfficeDetails', 'personalDetails', 'contactDetails' ], status);
  const decisionType = buildSectionObject('decisionType', [ 'decisionType' ], status);
  const checkAndSend = buildSectionObject('checkAndSend', [ checkAndSendTask ], status);

  return [
    yourDetails,
    decisionType,
    checkAndSend
  ];
}

async function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    const statusOverview = await getAppealStageStatus(req);
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
