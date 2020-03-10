import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { paths } from '../paths';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';
import { asBooleanValue } from '../utils/utils';

const askForMoreTimeFeatureEnabled: boolean = asBooleanValue(config.get('features.askForMoreTime'));

function getApplicationOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const isPartiallySaved = _.has(req.query, 'saved');
    const loggedInUserFullName = `${req.idam.userDetails.name}`;
    const appealRefNumber = req.session.appeal.application.homeOfficeRefNumber;
    const stages = buildProgressBarStages(req.session.appeal.appealStatus);
    return res.render('application-overview.njk', {
      name: loggedInUserFullName,
      appealRefNumber: appealRefNumber,
      applicationNextStep: getAppealApplicationNextStep(req),
      history: getAppealApplicationHistory(),
      stages,
      saved: isPartiallySaved,
      askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled
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
