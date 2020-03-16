import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';

function getApplicationOverview(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPartiallySaved = _.has(req.query, 'saved');

      const loggedInUserFullName: string = `${req.idam.userDetails.name}`;
      const appealRefNumber: string = req.session.appeal.application.homeOfficeRefNumber;
      const stagesStatus = buildProgressBarStages(req.session.appeal.appealStatus);
      const nextSteps = getAppealApplicationNextStep(req);
      const history = await getAppealApplicationHistory(req, updateAppealService);

      return res.render('application-overview.njk', {
        name: loggedInUserFullName,
        appealRefNumber: appealRefNumber,
        applicationNextStep: nextSteps,
        history: history,
        stages: stagesStatus,
        saved: isPartiallySaved
      });
    } catch (e) {
      next(e);
    }
  };
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
