import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';

function getApplicationOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const isPartiallySaved = _.has(req.query, 'saved');

    const loggedInUserFullName = `${req.idam.userDetails.name}`;
    const stages = buildProgressBarStages(req.session.appeal.appealStatus);
    return res.render('application-overview.njk', {
      name: loggedInUserFullName,
      applicationNextStep: getAppealApplicationNextStep(req),
      history: getAppealApplicationHistory(req),
      stages,
      saved: isPartiallySaved
    });
  } catch (e) {
    next(e);
  }
}

function setupApplicationOverviewController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.overview, getApplicationOverview(updateAppealService));
  return router;
}

export {
  setupApplicationOverviewController,
  getApplicationOverview
};
