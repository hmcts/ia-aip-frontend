import { NextFunction, Request, Response, Router } from 'express';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { appealApplicationStatus, buildSectionObject } from '../../utils/tasks-utils';

async function getAppealStageStatus(req: Request) {
  let drlmFeeRemissionFeatureFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
  const status = appealApplicationStatus(req.session.appeal, drlmFeeRemissionFeatureFlag);
  const paymentsFlag: boolean = await LaunchDarklyService.getInstance().getVariation(req, 'online-card-payments-feature', false);
  const checkAndSendTask = paymentsFlag ? 'checkAndSendWithPayments' : 'checkAndSend';
  const checkAndSendTaskDlrmSetAsideFlag = drlmFeeRemissionFeatureFlag && status.feeSupport ? checkAndSendTask + 'DlrmSetAsideFlag' : checkAndSendTask;
  const outsideUkWhenApplicationMade: boolean = (req.session.appeal.application.outsideUkWhenApplicationMade === 'Yes') || false;
  const humanRightsOrEEA: boolean = (req.session.appeal.application.appealType === 'refusalOfEu' || req.session.appeal.application.appealType === 'refusalOfHumanRights');
  const homeOfficeDetails: string = (outsideUkWhenApplicationMade && humanRightsOrEEA) ? 'homeOfficeDetailsOOC' : 'homeOfficeDetails';
  const yourDetails = buildSectionObject('yourDetails', ['typeOfAppeal', homeOfficeDetails, 'personalDetails', 'contactDetails'], status);
  const decisionType = buildSectionObject('decisionType', ['decisionType'], status);
  const feeSupport = drlmFeeRemissionFeatureFlag && status.feeSupport ? buildSectionObject('feeSupport', ['feeSupport'], status) : null;
  const checkAndSend = buildSectionObject('checkAndSend', [checkAndSendTaskDlrmSetAsideFlag], status);
  return drlmFeeRemissionFeatureFlag && status.feeSupport ? [
    yourDetails,
    decisionType,
    feeSupport,
    checkAndSend
  ] : [
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
