import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { FEATURE_FLAGS } from '../data/constants';
import { States } from '../data/states';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';
import UpdateAppealService from '../service/update-appeal-service';
import { getAppealApplicationNextStep, isPreAddendumEvidenceUploadState } from '../utils/application-state-utils';
import { getHearingCentre } from '../utils/cma-hearing-details';
import { formatDate, timeFormat } from '../utils/date-utils';
import { payLaterForApplicationNeeded } from '../utils/payments-utils';
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

function getHearingDetails(req: Request): Hearing {
  let hearingDetails: Hearing = {
    hearingCentre: '', time: '', date: ''
  };
  if (_.has(req.session.appeal, 'hearing')) {
    hearingDetails.hearingCentre = getHearingCentre(req);
    hearingDetails.time = moment(req.session.appeal.hearing.date).format(timeFormat);
    hearingDetails.date = formatDate(req.session.appeal.hearing.date);
    return hearingDetails;
  }
  return null;
}

function checkEnableProvideMoreEvidenceSection(appealStatus: string, featureEnabled: boolean) {
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
  let preAddendumEvidenceUploadState = isPreAddendumEvidenceUploadState(appealStatus);
  if (!preAddendumEvidenceUploadState) {
    return provideMoreEvidenceStates.includes(appealStatus);
  }
  return featureEnabled && preAddendumEvidenceUploadState;
}

function showAppealRequests(appealStatus: string, featureEnabled: boolean) {
  const showAppealRequestsStates = [
    States.APPEAL_SUBMITTED.id,
    States.AWAITING_RESPONDENT_EVIDENCE.id,
    States.AWAITING_REASONS_FOR_APPEAL.id,
    States.REASONS_FOR_APPEAL_SUBMITTED.id,
    States.CASE_UNDER_REVIEW.id,
    States.RESPONDENT_REVIEW.id,
    States.SUBMIT_HEARING_REQUIREMENTS.id,
    States.LISTING.id,
    States.PREPARE_FOR_HEARING.id,
    States.FINAL_BUNDLING.id,
    States.PRE_HEARING.id,
    States.DECISION.id,
    States.DECIDED.id,
    States.APPEAL_TAKEN_OFFLINE.id,
    States.FTPA_SUBMITTED.id,
    States.FTPA_DECIDED.id,
    States.AWAITING_CLARIFYING_QUESTIONS_ANSWERS.id,
    States.CLARIFYING_QUESTIONS_ANSWERED_SUBMITTED.id,
    States.AWAITING_CMA_REQUIREMENTS.id,
    States.CMA_REQUIREMENTS_SUBMITTED.id,
    States.CMA_ADJUSTMENTS_AGREED.id,
    States.CMA_LISTED.id,
    States.ADJOURNED.id
  ];
  return featureEnabled ? showAppealRequestsStates.includes(appealStatus) : featureEnabled;
}

function showAppealRequestsInAppealEndedStatus(appealStatus: string, featureEnabled: boolean): boolean {
  return featureEnabled ? States.ENDED.id === appealStatus : featureEnabled;
}

function showHearingRequests(appealStatus: string, featureEnabled: boolean) {
  const showHearingRequestsStates = [
    States.PREPARE_FOR_HEARING.id,
    States.FINAL_BUNDLING.id,
    States.PRE_HEARING.id,
    States.DECISION.id,
    States.ADJOURNED.id
  ];
  return featureEnabled ? showHearingRequestsStates.includes(appealStatus) : featureEnabled;
}

function isAppealInProgress(appealStatus: string) {
  return appealStatus !== States.APPEAL_STARTED.id && appealStatus !== States.PENDING_PAYMENT.id && appealStatus !== States.ENDED.id;
}

function getApplicationOverview(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: remove after Feature flag for AIP Hearing (Bundling) is permanently switched on
      const hearingBundleFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_BUNDLE, false);
      if (req.session.appeal.appealStatus === 'preHearing' || req.session.appeal.appealStatus === 'preHearingOutOfCountryFeatureDisabled') {
        req.session.appeal.appealStatus = hearingBundleFeatureEnabled ? 'preHearing' : 'preHearingOutOfCountryFeatureDisabled';
      }

      const makeApplicationFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.MAKE_APPLICATION, false);
      const uploadAddendumEvidenceFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false);

      const isPartiallySaved = _.has(req.query, 'saved');
      const askForMoreTime = _.has(req.query, 'ask-for-more-time');
      const saveAndAskForMoreTime = _.has(req.query, 'save-and-ask-for-more-time');
      const { appealReferenceNumber } = req.session.appeal;
      const loggedInUserFullName: string = getAppellantName(req);
      const appealRefNumber = getAppealRefNumber(appealReferenceNumber);
      const stagesStatus = buildProgressBarStages(req.session.appeal.appealStatus);
      const history = await getAppealApplicationHistory(req, updateAppealService);
      const nextSteps = await getAppealApplicationNextStep(req);
      const appealEnded = checkAppealEnded(req.session.appeal.appealStatus);
      const payLater = payLaterForApplicationNeeded(req) || isUnpaidPayNowProtectionAppeal(req);
      const hearingDetails = getHearingDetails(req);
      const showChangeRepresentation = isAppealInProgress(req.session.appeal.appealStatus);

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
        provideMoreEvidenceSection: checkEnableProvideMoreEvidenceSection(req.session.appeal.appealStatus, uploadAddendumEvidenceFeatureEnabled),
        showAppealRequests: showAppealRequests(req.session.appeal.appealStatus, makeApplicationFeatureEnabled),
        showAppealRequestsInAppealEndedStatus: showAppealRequestsInAppealEndedStatus(req.session.appeal.appealStatus, makeApplicationFeatureEnabled),
        showHearingRequests: showHearingRequests(req.session.appeal.appealStatus, makeApplicationFeatureEnabled),
        payLater,
        hearingDetails,
        showChangeRepresentation
      });
    } catch (e) {
      next(e);
    }
  };
}

function isUnpaidPayNowProtectionAppeal(req: Request): boolean {
  const appeal = req.session.appeal;
  const paymentStatus = appeal.paymentStatus;
  const appealType = appeal.application.appealType;
  const paAppealTypeAipPaymentOption = appeal.paAppealTypeAipPaymentOption;
  return appealType === 'protection' && paAppealTypeAipPaymentOption === 'payNow' && paymentStatus !== 'Paid';
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
  checkAppealEnded,
  checkEnableProvideMoreEvidenceSection,
  getHearingDetails,
  isUnpaidPayNowProtectionAppeal,
  showAppealRequests,
  showHearingRequests,
  showAppealRequestsInAppealEndedStatus
};
