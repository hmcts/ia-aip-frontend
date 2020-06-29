import { Request } from 'express';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import i18n from '../../locale/en.json';
import { Events } from '../data/events';
import { States } from '../data/states';
import { SecurityHeaders } from '../service/authentication-service';
import UpdateAppealService from '../service/update-appeal-service';

/**
 * Adds the timeline event into a mapper and returns back it's assigned key.
 * @param timeExtensionEvent the history event data to be inserted in the map
 * @param req the request containing the session to update the timeExtensionsMap
 */
function addToTimeExtensionMapper(timeExtensionEvent: HistoryEvent, req: Request) {
  const timeExtensionInternalId: string = uuid();
  const lastTimeExtension = timeExtensionEvent.data.timeExtensions[timeExtensionEvent.data.timeExtensions.length - 1];
  req.session.appeal.timeExtensionEventsMap.push(
    {
      id: timeExtensionInternalId,
      externalId: lastTimeExtension.id,
      historyData: timeExtensionEvent
    });
  return timeExtensionInternalId;
}

/**
 * Attempts to find the time extension event by id if found on the timeExtensionEventMap returns HistoryEvent data
 * @param id the timeExtensionId used as a lookup key
 * @param timeExtensionEventMap the time extension event map array.
 */
function timeExtensionIdToTimeExtensionData(id: string, timeExtensionEventMap: TimeExtensionEventMap[]) {
  const target: TimeExtensionEventMap = timeExtensionEventMap.find(e => e.id === id);
  if (target) {
    return target.historyData.data.timeExtensions.find(timeExt => timeExt.id === target.externalId);
  }
  return null;
}

/**
 * Construct an event object used in the sections, pulls the content of the event from the translations file.
 * @param event the event containing the date and id.
 * @param req the request containing the session to update the timeExtensionsMap
 */
function constructEventObject(event: HistoryEvent, req: Request) {

  const formattedDate = moment(event.createdDate).format('DD MMMM YYYY');
  const eventContent = JSON.parse(JSON.stringify(i18n.pages.overviewPage.timeline[event.id]));

  let eventObject = {
    date: formattedDate,
    text: eventContent.text,
    links: eventContent.links
  };
  // If it is a time extension submission the link should point to a timeExtensionMap resource
  if (event.id === Events.SUBMIT_TIME_EXTENSION.id) {
    const requestId: string = addToTimeExtensionMapper(event, req);
    eventObject.links[0].href = `${eventObject.links[0].href}/${requestId}`;
  }
  // If it is a time extension review the outcome should be injected within the text and point to  point to a timeExtensionMap resource
  if (event.id === Events.REVIEW_TIME_EXTENSION.id) {
    const reviewId: string = addToTimeExtensionMapper(event, req);
    eventObject.text = `${eventObject.text} ${event.data.reviewTimeExtensionDecision}.`;
    eventObject.links[0].href = `${eventObject.links[0].href}/${reviewId}`;
  }
  return eventObject;
}

/**
 * Constructs a section object, finds the events specified within the history and an optional case state
 * @param eventsToLookFor and array of type CcdEvent used to find events within the history
 * @param history the history
 * @param caseState optional use if a section must be constructed within a specific state only
 * @param req the request containing the session to update the timeExtensionsMap
 */
function constructSection(eventsToLookFor: CcdEvent[], history: HistoryEvent[], caseState: CcdState[] | null, req: Request) {

  const filteredEvents = caseState
    ? history.filter(h => eventsToLookFor.some(evnt => evnt.id === h.id) && caseState.some(cs => cs.id === h.state.id))
    : history.filter(h => eventsToLookFor.some(evnt => evnt.id === h.id));

  return filteredEvents.map(event => constructEventObject(event, req));
}

async function getAppealApplicationHistory(req: Request, updateAppealService: UpdateAppealService) {
  const authenticationService = updateAppealService.getAuthenticationService();
  const headers: SecurityHeaders = await authenticationService.getSecurityHeaders(req);
  const ccdService = updateAppealService.getCcdService();
  const history = await ccdService.getCaseHistory(req.idam.userDetails.uid, req.session.appeal.ccdCaseId, headers);

  req.session.appeal.history = history;

  const appealArgumentSection = [ Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS, Events.SUBMIT_REASONS_FOR_APPEAL, Events.SUBMIT_TIME_EXTENSION, Events.REVIEW_TIME_EXTENSION, Events.SUBMIT_CMA_REQUIREMENTS ];
  const appealDetailsSection = [ Events.SUBMIT_APPEAL ];

  return {
    appealArgumentSection: constructSection(appealArgumentSection, history, [ States.CLARIFYING_QUESTIONS_SUBMITTED, States.REASONS_FOR_APPEAL_SUBMITTED, States.AWAITING_REASONS_FOR_APPEAL, States.AWAITING_CLARIFYING_QUESTIONS, States.CMA_REQUIREMENTS_SUBMITTED ], req),
    appealDetailsSection: constructSection(appealDetailsSection, history, null, req)
  };
}

export {
  getAppealApplicationHistory,
  timeExtensionIdToTimeExtensionData,
  constructSection
};
