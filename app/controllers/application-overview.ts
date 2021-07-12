import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';
import { getAppealApplicationHistory } from '../utils/timeline-utils';
import { asBooleanValue, hasInflightTimeExtension } from '../utils/utils';

function getAppealRefNumber(appealRef: string) {
  if (appealRef && appealRef.toUpperCase() === 'DRAFT') {
    return null;
  }
  return appealRef;
}

function checkAppealEnded(appealStatus: string): boolean {
  if (appealStatus && appealStatus.toUpperCase() === 'ENDED') {
    return true;
  }
  return false;
}

const askForMoreTimeFeatureEnabled: boolean = asBooleanValue(config.get('features.askForMoreTime'));

function getAppellantName(req: Request) {
  let name = req.idam.userDetails.name;
  if (_.has(req.session.appeal, 'application.personalDetails.givenNames')) {
    name = `${req.session.appeal.application.personalDetails.givenNames} ${req.session.appeal.application.personalDetails.familyName}`;
  }
  return name;
}

function getApplicationOverview(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPartiallySaved = _.has(req.query, 'saved');
      const { appealReferenceNumber } = req.session.appeal;
      const loggedInUserFullName: string = getAppellantName(req);
      const appealRefNumber = getAppealRefNumber(appealReferenceNumber);
      const stagesStatus = buildProgressBarStages(req.session.appeal.appealStatus);
      const history = await getAppealApplicationHistory(req, updateAppealService);
      const nextSteps = getAppealApplicationNextStep(req);
      const appealEnded = checkAppealEnded(req.session.appeal.appealStatus);

      return res.render('application-overview.njk', {
        name: loggedInUserFullName,
        appealRefNumber: appealRefNumber,
        applicationNextStep: nextSteps,
        history: history,
        stages: stagesStatus,
        saved: isPartiallySaved,
        ended: appealEnded,
        askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled,
        askForMoreTimeInFlight: hasInflightTimeExtension(req.session.appeal)
      });
    } catch (e) {
      next(e);
    }
  };
}

function setupApplicationOverviewController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.overview, getApplicationOverview(updateAppealService));
  return router;
}

export {
  setupApplicationOverviewController,
  getApplicationOverview,
  getAppealRefNumber,
  checkAppealEnded
};
