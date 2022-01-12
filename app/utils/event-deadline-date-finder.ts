import config from 'config';
import { Request } from 'express';
import moment from 'moment';
import { dayMonthYearFormat } from './date-utils';

const daysToWaitAfterSubmission = config.get('daysToWait.afterSubmission');
const daysToWaitAfterReasonsForAppeal = config.get('daysToWait.afterReasonsForAppeal');
const daysToWaitAfterCQSubmission = config.get('daysToWait.afterCQSubmission');

/**
 * Finds a targeted direction, retrieves it's due date and returns it as a string with the correct date format
 * @param directions the directions
 * @param directionTagToLookFor the direction to find
 */
function getFormattedDirectionDueDate(directions: Direction[], directionTagToLookFor: string) {
  let formattedDeadline = null;
  if (directions) {
    const direction = directions.find(d => d.tag === directionTagToLookFor);
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
 * Given the current case status it retrieves deadlines based on the business logic.
 * @param currentAppealStatus the appeal status
 * @param req the request containing  all the directions in session
 */
function getDeadline(currentAppealStatus: string, req: Request): string {

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
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitAppeal', daysToWaitAfterSubmission);
      break;
    }
    case 'awaitingReasonsForAppeal':
    case 'awaitingReasonsForAppealPartial': {
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, 'requestReasonsForAppeal');
      break;
    }
    case 'reasonsForAppealSubmitted': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitReasonsForAppeal', daysToWaitAfterReasonsForAppeal);
      break;
    }
    case 'awaitingClarifyingQuestionsAnswersPartial':
    case 'awaitingClarifyingQuestionsAnswers': {
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, 'requestClarifyingQuestions');
      break;
    }
    case 'clarifyingQuestionsAnswersSubmitted': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitClarifyingQuestionAnswers', daysToWaitAfterCQSubmission);
      break;
    }
    case 'awaitingCmaRequirements': {
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions, 'requestCmaRequirements');
      break;
    }
    case 'cmaAdjustmentsAgreed':
    case 'cmaRequirementsSubmitted': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'submitCmaRequirements', 14);
      break;
    }
    case 'decisionMaintained': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'requestRespondentReview', 5);
      break;
    }
    case 'decisionWithdrawn':
    case 'respondentReview': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'requestRespondentReview', 14);
      break;
    }
    case 'listing':
    case 'draftHearingRequirements': {
      formattedDeadline = getFormattedEventHistoryDate(history, 'draftHearingRequirements', 14);
      break;
    }
    case 'submitHearingRequirements':
      formattedDeadline = getFormattedDirectionDueDate(req.session.appeal.directions,'legalRepresentativeHearingRequirements');
      break;
    default: {
      formattedDeadline = 'TBC';
      break;
    }
  }

  return formattedDeadline;
}

export {
  getDeadline
};
