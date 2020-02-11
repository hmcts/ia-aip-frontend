import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';

function getApplicationOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const loggedInUserFullName = `${req.idam.userDetails.forename} ${req.idam.userDetails.surname}`;
    const stages = buildProgressBarStages(req.session.appeal.appealStatus);
    return res.render('application-overview.njk', {
      name: loggedInUserFullName,
      applicationNextStep: getAppealApplicationNextStep(req),
      history: getAppealApplicationHistory(),
      stages

    });
  } catch (e) {
    next(e);
  }
}

function setupApplicationOverviewController(): Router {
  const router = Router();
  router.get(paths.overview, getApplicationOverview);

  return router;
}

export {
  setupApplicationOverviewController,
  getApplicationOverview
};
