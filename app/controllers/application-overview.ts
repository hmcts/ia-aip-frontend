import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { FEATURE_FLAGS } from '../data/constants';
import { States } from '../data/states';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';
import UpdateAppealService from '../service/update-appeal-service';
import {
  getAppealApplicationNextStep,
  isAddendumEvidenceUploadState,
  transferredToUpperTribunal
} from '../utils/application-state-utils';
import { getHearingCentre } from '../utils/cma-hearing-details';
import { formatDate, timeFormat } from '../utils/date-utils';
import Logger, { getLogLabel } from '../utils/logger';
import { payLaterForApplicationNeeded, payNowForApplicationNeeded } from '../utils/payments-utils';
import { buildProgressBarStages } from '../utils/progress-bar-utils';
import { getAppealApplicationHistory } from '../utils/timeline-utils';
import { hasPendingTimeExtension, yesNoToBool } from '../utils/utils';
import { ErrorCode } from './cases-list';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function getAppealRefNumber(appealRef: string) {
  if (appealRef && appealRef.toUpperCase() === 'DRAFT') {
    return null;
  }
  return appealRef;
}

function checkAppealEnded(appealStatus: string): boolean {
  return appealStatus && appealStatus.toUpperCase() === 'ENDED';
}

function getAppellantName(req: Request) {
  let name = req.idam.userDetails.name;
  if (_.has(req.session.appeal, 'application.personalDetails.givenNames')) {
    name = `${req.session.appeal.application.personalDetails.givenNames} ${req.session.appeal.application.personalDetails.familyName}`;
  }
  return name;
}

function getHearingDetails(req: Request): Hearing {
  const hearingDetails: Hearing = {
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

function checkEnableProvideMoreEvidenceSection(appealStatus: string, isCitizen: boolean) {
  const provideMoreEvidenceStates = [
    States.RESPONDENT_REVIEW.id,
    States.SUBMIT_HEARING_REQUIREMENTS.id,
    States.LISTING.id,
    States.PREPARE_FOR_HEARING.id,
    States.FINAL_BUNDLING.id,
    States.PRE_HEARING.id,
    States.DECISION.id,
    States.DECIDED.id,
    States.FTPA_SUBMITTED.id,
    States.FTPA_DECIDED.id,
    States.REASONS_FOR_APPEAL_SUBMITTED.id,
    States.AWAITING_CMA_REQUIREMENTS.id,
    States.CMA_REQUIREMENTS_SUBMITTED.id,
    States.CMA_ADJUSTMENTS_AGREED.id,
    States.CMA_LISTED.id,
    States.ADJOURNED.id
  ];
  const preAddendumEvidenceUploadState = isAddendumEvidenceUploadState(appealStatus);
  if (!preAddendumEvidenceUploadState) {
    return isCitizen && provideMoreEvidenceStates.includes(appealStatus);
  }
  return isCitizen && preAddendumEvidenceUploadState;
}

function showAppealRequestSection(appealStatus: string, isCitizen: boolean) {
  const showAppealRequestsStates = [
    States.APPEAL_SUBMITTED.id,
    States.PENDING_PAYMENT.id,
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
    States.AWAITING_CMA_REQUIREMENTS.id,
    States.CMA_REQUIREMENTS_SUBMITTED.id,
    States.CMA_ADJUSTMENTS_AGREED.id,
    States.CMA_LISTED.id,
    States.ADJOURNED.id
  ];
  return isCitizen && showAppealRequestsStates.includes(appealStatus);
}

function showAppealRequestSectionInAppealEndedStatus(appealStatus: string, isCitizen: boolean): boolean {
  return isCitizen && States.ENDED.id === appealStatus;
}

function showHearingRequestSection(appealStatus: string) {
  const showHearingRequestsStates = [
    States.PREPARE_FOR_HEARING.id,
    States.FINAL_BUNDLING.id,
    States.PRE_HEARING.id,
    States.DECISION.id,
    States.ADJOURNED.id
  ];
  return showHearingRequestsStates.includes(appealStatus);
}

export const endedStates = [States.APPEAL_STARTED.id, States.PENDING_PAYMENT.id, States.ENDED.id];

function isAppealInProgress(appealStatus: string, isCitizen: boolean) {
  return isCitizen && !endedStates.includes(appealStatus);
}

function getApplicationOverview(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.caseId) {
      const caseId = req.query.caseId as string;
      try {
        await updateAppealService.loadAppealByCaseId(caseId, req);
      } catch (error) {
        logger.exception(error, logLabel);
        return res.redirect(`${paths.common.casesList}?errorCode=${ErrorCode.caseNotFound}&caseId=${caseId}`);
      }
    }

    try {
      if (!req.session?.appeal?.application) {
        return res.redirect(paths.common.casesList);
      }

      // TODO: remove after Feature flag for AIP Hearing (Bundling) is permanently switched on
      if (req.session.appeal.appealStatus === 'preHearing' || req.session.appeal.appealStatus === 'preHearingOutOfCountryFeatureDisabled') {
        req.session.appeal.appealStatus = 'preHearing';
      }

      const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);

      const isCitizen: boolean = !req.session.isNonLegalRep;
      const isPartiallySaved = _.has(req.query, 'saved');
      const askForMoreTime = _.has(req.query, 'ask-for-more-time');
      const saveAndAskForMoreTime = _.has(req.query, 'save-and-ask-for-more-time');
      const {
        appealReferenceNumber,
        appealStatus,
        paymentStatus,
        paAppealTypeAipPaymentOption,
        stf24wPreviousStatusWasYesAutoGenerated
      } = req.session.appeal;
      const loggedInUserFullName: string = getAppellantName(req);
      const appealRefNumber = getAppealRefNumber(appealReferenceNumber);
      const is24WeeksTimeline = yesNoToBool(stf24wPreviousStatusWasYesAutoGenerated);
      const stagesStatus = buildProgressBarStages(appealStatus, req.session.isNonLegalRep, paymentStatus, is24WeeksTimeline);
      const history = await getAppealApplicationHistory(req, updateAppealService);
      const nextSteps = await getAppealApplicationNextStep(req);
      const appealEnded = checkAppealEnded(appealStatus);
      const hearingDetails = getHearingDetails(req);
      let showPayLaterLink = isCitizen && (payLaterForApplicationNeeded(req) || payNowForApplicationNeeded(req)) && !isPostDecisionState(appealStatus);
      if (refundFeatureEnabled) {
        showPayLaterLink = (req.session.appeal.application.refundConfirmationApplied || payLaterForApplicationNeeded(req) || payNowForApplicationNeeded(req))
          && !isPostDecisionState(appealStatus)
          && !isRemissionApprovedOrPartiallyApproved(req.session.appeal);
      }

      const provideMoreEvidenceSection = checkEnableProvideMoreEvidenceSection(req.session.appeal.appealStatus, isCitizen);
      const showAppealRequests = showAppealRequestSection(req.session.appeal.appealStatus, isCitizen);
      const showAppealRequestsInAppealEndedStatus = showAppealRequestSectionInAppealEndedStatus(req.session.appeal.appealStatus, isCitizen);
      const showHearingRequests = isCitizen && showHearingRequestSection(req.session.appeal.appealStatus)
        && !isPostDecisionState(appealStatus);

      const application = req.session.appeal.application;

      const showAskForFeeRemission = refundFeatureEnabled
        && ((paAppealTypeAipPaymentOption === 'payLater' && application.appealType === 'protection') || 'Paid' === paymentStatus)
        && (!application.refundRequested || application.refundRequested && !!application.remissionDecision);

      const showAskForSomethingInEndedState = refundFeatureEnabled && showAppealRequestsInAppealEndedStatus;

      const hasSponsor = application?.hasSponsor === 'Yes';
      const hasNlr = application?.hasNonLegalRep === 'Yes' && req.session.appeal?.nlrDetails?.idamId != null;
      const appealInProgress = isAppealInProgress(appealStatus, isCitizen);
      return res.render('application-overview.njk', {
        name: loggedInUserFullName,
        appealRefNumber: appealRefNumber,
        applicationNextStep: nextSteps,
        history: history,
        stages: stagesStatus,
        saved: isPartiallySaved,
        ended: appealEnded,
        transferredToUt: transferredToUpperTribunal(req),
        askForMoreTimeInFlight: hasPendingTimeExtension(req.session.appeal),
        askForMoreTime,
        saveAndAskForMoreTime,
        provideMoreEvidenceSection,
        showAppealRequests,
        showAppealRequestsInAppealEndedStatus,
        showHearingRequests,
        showPayLaterLink,
        hearingDetails,
        showChangeRepresentation: appealInProgress,
        showFtpaApplicationLink: showFtpaApplicationLink(req.session.appeal, isCitizen),
        showAskForFeeRemission,
        showNonLegalRep: appealInProgress,
        addNonLegalRepPath: hasNlr ? paths.nonLegalRep.addAnotherNonLegalRep : paths.nonLegalRep.addNonLegalRep,
        updateNlrPath: hasSponsor ? paths.nonLegalRep.updateIsSamePerson : paths.nonLegalRep.updateName,
        showAskForSomethingInEndedState,
        isNonLegalRep: !isCitizen,
        isPostDecisionState: isPostDecisionState(appealStatus),
        previousPage: paths.common.casesList,
        previousPageText: i18n.components.back.backToCasesList
      });
    } catch (e) {
      next(e);
    }
  };
}

function isPostDecisionState(appealStatus: string) {
  const postDecisionStates = [States.DECIDED.id, States.FTPA_SUBMITTED.id, States.FTPA_DECIDED.id];

  return postDecisionStates.includes(appealStatus);
}

function showFtpaApplicationLink(appeal: Appeal, isCitizen: boolean) {
  return [States.FTPA_SUBMITTED.id, States.FTPA_DECIDED.id].includes(appeal.appealStatus)
    && hasRespondentFtpaApplication(appeal)
    && !hasAppellantFtpaApplication(appeal)
    && isCitizen;
}

function hasAppellantFtpaApplication(appeal: Appeal): boolean {
  return !!(appeal.ftpaAppellantApplicationDate || appeal.ftpaAppellantDecisionDate);
}

function hasRespondentFtpaApplication(appeal: Appeal): boolean {
  return !!(appeal.ftpaRespondentApplicationDate || appeal.ftpaRespondentDecisionDate);
}

function setupApplicationOverviewController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.overview, getApplicationOverview(updateAppealService));
  return router;
}

function isRemissionApprovedOrPartiallyApproved(appeal: Appeal): boolean {
  const remissionDecision = appeal.application.remissionDecision;
  return (remissionDecision === 'approved' || remissionDecision === 'partiallyApproved');
}

export {
  setupApplicationOverviewController,
  getApplicationOverview,
  getAppealRefNumber,
  checkAppealEnded,
  checkEnableProvideMoreEvidenceSection,
  getHearingDetails,
  showAppealRequestSection,
  showHearingRequestSection,
  isPostDecisionState,
  showAppealRequestSectionInAppealEndedStatus,
  showFtpaApplicationLink,
  isAppealInProgress,
  getAppellantName
};
