import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { paths } from '../paths';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';

function getApplicationOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const isPartiallySaved = _.has(req.query, 'saved');
    const loggedInUserFullName = `${req.idam.userDetails.forename} ${req.idam.userDetails.surname}`;
    const appealRefNumber = req.session.appeal.application.homeOfficeRefNumber;
    const stages = buildProgressBarStages(req.session.appeal.appealStatus);
    return res.render('application-overview.njk', {
      name: loggedInUserFullName,
      appealRefNumber: appealRefNumber,
      applicationNextStep: getAppealApplicationNextStep(req),
      history: getAppealApplicationHistory(),
      stages,
      saved: isPartiallySaved
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
