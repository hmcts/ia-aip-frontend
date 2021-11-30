import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { States } from '../data/states';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { getAppealApplicationNextStep } from '../utils/application-state-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';
import { getAppealApplicationHistory } from '../utils/timeline-utils';
import { hasPendingTimeExtension } from '../utils/utils';

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
      const askForMoreTime = _.has(req.query, 'ask-for-more-time');
      const saveAndAskForMoreTime = _.has(req.query, 'save-and-ask-for-more-time');
      const { appealReferenceNumber } = req.session.appeal;
      const loggedInUserFullName: string = getAppellantName(req);
      const appealRefNumber = getAppealRefNumber(appealReferenceNumber);
      const stagesStatus = buildProgressBarStages(req.session.appeal.appealStatus);
      const history = await getAppealApplicationHistory(req, updateAppealService);
      const nextSteps = getAppealApplicationNextStep(req);
      const appealEnded = checkAppealEnded(req.session.appeal.appealStatus);
      const provideMoreEvidenceStates = [
        States.RESPONDENT_REVIEW.id,
        States.SUBMIT_HEARING_REQUIREMENTS.id,
        States.LISTING.id,
        States.PREPARE_FOR_HEARING.id,
        States.FINAL_BUNDLING.id,
        States.PRE_HEARING.id,
        States.DECISION.id,
        States.DECIDED.id,
        States.REASONS_FOR_APPEAL_SUBMITTED.id,
        States.AWAITING_CMA_REQUIREMENTS.id,
        States.CMA_REQUIREMENTS_SUBMITTED.id,
        States.CMA_ADJUSTMENTS_AGREED.id,
        States.CMA_LISTED.id,
        States.ADJOURNED.id
      ];

      return res.render('application-overview.njk', {
        name: loggedInUserFullName,
        appealRefNumber: appealRefNumber,
        applicationNextStep: nextSteps,
        history: history,
        stages: stagesStatus,
        saved: isPartiallySaved,
        ended: appealEnded,
        askForMoreTimeInFlight: hasPendingTimeExtension(req.session.appeal),
        askForMoreTime,
        saveAndAskForMoreTime,
        provideMoreEvidenceSection: provideMoreEvidenceStates.includes(req.session.appeal.appealStatus)
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
