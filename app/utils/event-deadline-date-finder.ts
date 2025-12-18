import config from 'config';
import { Request } from 'express';
import moment from 'moment';
import { Events } from '../data/events';
import {
  isUpdateTribunalDecideWithRule31,
  isUpdateTribunalDecideWithRule32
} from '../utils/utils';
import { dayMonthYearFormat } from './date-utils';
import { appealHasNoRemissionOption, appealHasRemissionOption } from './remission-utils';

const daysToWaitAfterSubmission = config.get('daysToWait.afterSubmission');
const daysToWaitPendingPayment = config.get('daysToWait.pendingPayment');
const daysToWaitAfterSubmissionOoc = config.get('daysToWait.afterSubmissionOoc');
const daysToWaitPendingPaymentOoc = config.get('daysToWait.pendingPaymentOoc');
const daysToWaitAfterReasonsForAppeal = config.get('daysToWait.afterReasonsForAppeal');
const daysToWaitAfterCQSubmission = config.get('daysToWait.afterCQSubmission');
const dueDateFtpaDecisionResponse = config.get('dueDate.ftpaDecisionResponse');
const dueDateJudgeDecisionResponse = config.get('dueDate.judgeDecisionResponse');
const dueDateFtpaDecisionResponseOoc = config.get('dueDate.ftpaDecisionResponseOoc');
const dueDateJudgeDecisionResponseOoc = config.get('dueDate.judgeDecisionResponseOoc');
const cmaAdjustmentsDeadline = config.get('daysToWait.cmaAdjustmentsDeadline');
const daysToWaitAfterDecisionMaintained = config.get('daysToWait.decisionMaintained');
const daysToWaitAfterDecisionWithdrawn = config.get('daysToWait.decisionWithdrawn');
const dueDateHearingRequirements = config.get('dueDate.hearingRequirements');

/**
 * Finds a targeted direction, retrieves it's due date and returns it as a string with the correct date format
 * @param directions the directions
 * @param directionTagToLookFor the direction to find
 */
function getFormattedDirectionDueDate(directions: Direction[], directionTagsToLookFor: string[]) {
  let formattedDeadline = null;
  if (directions) {
    const direction = directions.find(d => directionTagsToLookFor.includes(d.tag));
    if (direction) {
      const dueDate = direction.dateDue;
      formattedDeadline = moment(dueDate).format(dayMonthYearFormat);
    }
  }
  return formattedDeadline;
}

/**
 * Finds a targeted event in history, retrieves the date when the event was triggered date and
 * returns it as a string with the correct date format and added days specified as daysToAdd
 * @param history the events history
 * @param eventTagToLookFor the event to look for
 * @param daysToAdd days to add to the event triggering date
 */
function getFormattedEventHistoryDate(history: HistoryEvent[], eventTagToLookFor: string, daysToAdd: any): string {
  let formattedDeadline = null;
  if (history) {
    const historyEvent = history.find(h => h.id === eventTagToLookFor);
    formattedDeadline = null;
    if (historyEvent) {
      const triggeringDate = historyEvent.createdDate;
      formattedDeadline = moment(triggeringDate).add(daysToAdd, 'days').format(dayMonthYearFormat);
    }
  }
  return formattedDeadline;
}

/**
 * @param req the request containing the appeal information
 * @returns deadline for the appeallnt to respond to Judge's decision
 */
function getDueDateForAppellantToRespondToJudgeDecision(req: Request, ftpaSetAsideFeatureEnabled: Boolean = false) {

  let theDateOfdecisionAndReasons;
  if (isUpdateTribunalDecideWithRule31(req, ftpaSetAsideFeatureEnabled.valueOf())) {
    theDateOfdecisionAndReasons = req.session.appeal.history.find(history => history.id === Events.UPDATE_TRIBUNAL_DECISION.id).createdDate;
  } else if (isUpdateTribunalDecideWithRule32(req, ftpaSetAsideFeatureEnabled.valueOf())) {
    return null;
  } else {
    theDateOfdecisionAndReasons = req.session.appeal.finalDecisionAndReasonsDocuments.find(doc => doc.tag === 'finalDecisionAndReasonsPdf').dateUploaded;
  }

  let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
  // if it's out of country appeal it's 28 days otherwise it's 14 days
  let noOfDays = (appealOutOfCountry && appealOutOfCountry === 'Yes') ? dueDateJudgeDecisionResponseOoc : dueDateJudgeDecisionResponse;
  return moment(theDateOfdecisionAndReasons).add(noOfDays, 'days').format(dayMonthYearFormat);
}

/**
 * @param req the request containing the appeal information
 * @returns deadline for the appeallant to respond to FTPA decision
 */
function getDueDateForAppellantToRespondToFtpaDecision(req: Request) {
  let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
  // if it's out of country appeal it's 28 days otherwise it's 14 days
  let noOfDays = (appealOutOfCountry && appealOutOfCountry === 'Yes') ? dueDateFtpaDecisionResponseOoc : dueDateFtpaDecisionResponse;
  return moment(req.session.appeal.ftpaAppellantDecisionDate).add(noOfDays, 'days').format(dayMonthYearFormat);
}

/**
 * Given the current case status it retrieves deadlines based on the business logic.
 * @param currentAppealStatus the appeal status
 * @param req the request containing  all the directions in session
 * @param dlrmFeeRemissionFlag value of DLRM_FEE_REMISSION_FEATURE_FLAG
 */
function getDeadline(currentAppealStatus: string, req: Request, dlrmFeeRemissionFlag: Boolean = false, ftpaSetAsideFeatureEnabled: Boolean = false): string {

  const history = req.session.appeal.history;
  let formattedDeadline;

  switch (currentAppealStatus) {
    case 'appealStarted':
    case 'appealStartedPartial': {
      formattedDeadline = null;
      break;
    }
    case 'appealSubmitted':
    case 'lateAppealSubmitted':
    case 'awaitingRespondentEvidence': {
      if (dlrmFeeRemissionFlag &&
        !appealHasNoRemissionOption(req.session.appeal.application)) {
        let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
        let noOfDays = (appealOutOfCountry && appealOutOfCountry === 'Yes') ? daysToWaitAfterSubmissionOoc : daysToWaitAfterSubmission;
        formattedDeadline = getFormattedEventHistoryDate(history, 'submitAppeal', noOfDays);
      } else {
        formattedDeadline = getFormattedEventHistoryDate(history, 'submitAppeal', daysToWaitAfterSubmission);
      }
      break;
    }
    case 'pendingPayment': {
      if (dlrmFeeRemissionFlag && appealHasRemissionOption(req.session.appeal.application)) {
        let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
        let noOfDays = (appealOutOfCountry && appealOutOfCountry === 'Yes') ? daysToWaitPendingPaymentOoc : daysToWaitPendingPayment;
        formattedDeadline = getFormattedEventHistoryDate(history, 'submitAppeal', noOfDays);
      } else {
        formattedDeadline = getFormattedEventHistoryDate(history, 'submitAppeal', daysToWaitPendingPayment);
      }
      break;
    }
    case 'awaitingReasonsForAppeal':
    case 'awaitingReasonsForAppealPartial': {
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, ['requestReasonsForAppeal','requestCaseBuilding']);
      break;
    }
    case 'reasonsForAppealSubmitted': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitReasonsForAppeal', daysToWaitAfterReasonsForAppeal);
      break;
    }
    case 'caseUnderReview': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'buildCase', daysToWaitAfterReasonsForAppeal);
      break;
    }
    case 'awaitingClarifyingQuestionsAnswersPartial':
    case 'awaitingClarifyingQuestionsAnswers': {
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, ['requestClarifyingQuestions']);
      break;
    }
    case 'clarifyingQuestionsAnswersSubmitted': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitClarifyingQuestionAnswers', daysToWaitAfterCQSubmission);
      break;
    }
    case 'awaitingCmaRequirements': {
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, ['requestCmaRequirements']);
      break;
    }
    case 'cmaAdjustmentsAgreed':
    case 'cmaRequirementsSubmitted': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitCmaRequirements', cmaAdjustmentsDeadline);
      break;
    }
    case 'decisionMaintained': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'requestRespondentReview', daysToWaitAfterDecisionMaintained);
      break;
    }
    case 'decisionWithdrawn':
    case 'respondentReview': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'requestRespondentReview', daysToWaitAfterDecisionWithdrawn);
      break;
    }
    case 'listing':
    case 'draftHearingRequirements': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'draftHearingRequirements', dueDateHearingRequirements);
      break;
    }
    case 'submitHearingRequirements':
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, ['legalRepresentativeHearingRequirements']);
      break;
    case 'decided':
      formattedDeadline = getDueDateForAppellantToRespondToJudgeDecision(req, ftpaSetAsideFeatureEnabled);
      break;
    default: {
      formattedDeadline = 'TBC';
      break;
    }
  }

  return formattedDeadline;
}

export {
  getDeadline,
  getDueDateForAppellantToRespondToJudgeDecision,
  getFormattedDirectionDueDate,
  getDueDateForAppellantToRespondToFtpaDecision
};
