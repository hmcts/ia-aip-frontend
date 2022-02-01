import { Request } from 'express';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { FEATURE_FLAGS } from '../data/constants';
import { Events } from '../data/events';
import { States } from '../data/states';
import { SecurityHeaders } from '../service/authentication-service';
import LaunchDarklyService from '../service/launchDarkly-service';
import UpdateAppealService from '../service/update-appeal-service';

/**
 * Construct an event object used in the sections, pulls the content of the event from the translations file.
 * @param event the event containing the date and id.
 * @param req the request containing the session to update the timeExtensionsMap
 */
function constructEventObject(event: HistoryEvent, req: Request) {

  const eventContent = i18n.pages.overviewPage.timeline[event.id];

  let eventObject = {
    date: moment(event.createdDate).format('DD MMMM YYYY'),
    dateObject: new Date(event.createdDate),
    text: eventContent.text || null,
    links: eventContent.links
  };

  if (event.id === Events.RECORD_OUT_OF_TIME_DECISION.id) {
    eventObject.text = i18n.pages.overviewPage.timeline[event.id].type[req.session.appeal.outOfTimeDecisionType];
  }
  if (event.id === Events.REQUEST_RESPONSE_REVIEW.id) {
    eventObject.links[0].text = i18n.pages.overviewPage.timeline[event.id].status[req.session.appeal.appealReviewOutcome].text;
    eventObject.links[0].href = i18n.pages.overviewPage.timeline[event.id].status[req.session.appeal.appealReviewOutcome].href;
  }
  return eventObject;
}

/**
 * Constructs a section object, finds the events specified within the history and an optional case state
 * @param eventsToLookFor and array of type CcdEvent used to find events within the history
 * @param events the history events
 * @param states optional use if a section must be constructed within a specific state only
 * @param req the request containing the session to update the timeExtensionsMap
 */
function constructSection(eventsToLookFor: string[], events: HistoryEvent[], states: string[] | null, req: Request) {

  const filteredEvents = states
    ? events.filter(event => eventsToLookFor.includes(event.id) && states.includes(event.state.id))
    : events.filter(event => eventsToLookFor.includes(event.id));

  return filteredEvents.map(event => constructEventObject(event, req));
}

function getTimeExtensionsEvents(makeAnApplications: Collection<Application<Evidence>>[]): any[] {
  const makeDirectionsFlatMap = makeAnApplications ? makeAnApplications.flatMap(application => {
    const request = {
      id: application.id,
      date: moment(application.value.date).format('DD MMMM YYYY'),
      dateObject: new Date(application.value.date),
      text: i18n.pages.overviewPage.timeline.makeAnApplication.text,
      links: [{
        ...i18n.pages.overviewPage.timeline.makeAnApplication.links[0],
        href: `${i18n.pages.overviewPage.timeline.makeAnApplication.links[0].href}/${application.id}`
      }]
    };
    let decision;
    if (application.value.decision !== 'Pending') {
      decision = {
        id: application.id,
        date: moment(application.value.date).format('DD MMMM YYYY'),
        dateObject: new Date(application.value.decisionDate),
        text: i18n.pages.overviewPage.timeline.decideAnApplication[application.value.decision],
        links: [{
          ...i18n.pages.overviewPage.timeline.decideAnApplication.links[0],
          href: `${i18n.pages.overviewPage.timeline.decideAnApplication.links[0].href}/${application.id}`
        }]
      };
      return [ decision, request ];
    }
    return [ request ];
  }) : [];

  return makeDirectionsFlatMap;
}

async function getAppealApplicationHistory(req: Request, updateAppealService: UpdateAppealService) {
  const authenticationService = updateAppealService.getAuthenticationService();
  const headers: SecurityHeaders = await authenticationService.getSecurityHeaders(req);
  const ccdService = updateAppealService.getCcdService();
  req.session.appeal.history = await ccdService.getCaseHistory(req.idam.userDetails.uid, req.session.appeal.ccdCaseId, headers);

  const appealHearingRequirementsSectionEvents = [ Events.SUBMIT_AIP_HEARING_REQUIREMENTS.id, Events.STITCHING_BUNDLE_COMPLETE.id ];
  const hearingBundleFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_BUNDLE, false);
  if (hearingBundleFeatureEnabled) {
    appealHearingRequirementsSectionEvents.push(Events.LIST_CASE.id);
  }

  const appealArgumentSectionEvents = [ Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS.id, Events.SUBMIT_REASONS_FOR_APPEAL.id, Events.REQUEST_RESPONDENT_REVIEW.id, Events.REQUEST_RESPONSE_REVIEW.id, Events.SUBMIT_CMA_REQUIREMENTS.id, Events.LIST_CMA.id, Events.REQUEST_HEARING_REQUIREMENTS_FEATURE.id, Events.END_APPEAL.id, Events.RECORD_OUT_OF_TIME_DECISION.id ];
  const appealDecisionSectionEvents = [ Events.SEND_DECISION_AND_REASONS.id ];
  const appealDetailsSectionEvents = [ Events.SUBMIT_APPEAL.id ];

  const appealDecisionSection = constructSection(appealDecisionSectionEvents, req.session.appeal.history, null, req);
  const appealHearingRequirementsSection = constructSection(appealHearingRequirementsSectionEvents, req.session.appeal.history, null, req);
  const appealArgumentSection = constructSection(appealArgumentSectionEvents, req.session.appeal.history, [ States.APPEAL_SUBMITTED.id, States.CLARIFYING_QUESTIONS_SUBMITTED.id, States.REASONS_FOR_APPEAL_SUBMITTED.id, States.AWAITING_REASONS_FOR_APPEAL.id, States.RESPONDENT_REVIEW.id, States.AWAITING_CLARIFYING_QUESTIONS.id, States.CMA_REQUIREMENTS_SUBMITTED.id, States.CMA_LISTED.id, States.SUBMIT_HEARING_REQUIREMENTS.id, States.ENDED.id ], req);
  const appealDetailsSection = constructSection(appealDetailsSectionEvents, req.session.appeal.history, null, req);

  const timeExtensions = getTimeExtensionsEvents(req.session.appeal.makeAnApplications);

  const { paymentStatus, paAppealTypeAipPaymentOption = null, paymentDate } = req.session.appeal;
  let paymentEvent = [];
  if (paymentStatus === 'Paid' && paAppealTypeAipPaymentOption === 'payLater') {
    paymentEvent = [{
      date: moment(paymentDate).format('DD MMMM YYYY'),
      dateObject: new Date(paymentDate),
      text: i18n.pages.overviewPage.timeline.paymentAppeal.text || null,
      links: i18n.pages.overviewPage.timeline.paymentAppeal.links
    }];
  }

  const argumentSection = appealArgumentSection.concat(timeExtensions, paymentEvent)
    .sort((a: any, b: any) => b.dateObject - a.dateObject);

  return {
    ...(appealDecisionSection && appealDecisionSection.length > 0) &&
    { appealDecisionSection: appealDecisionSection },
    ...(appealHearingRequirementsSection && appealHearingRequirementsSection.length > 0) &&
    { appealHearingRequirementsSection: appealHearingRequirementsSection },
    appealArgumentSection: argumentSection,
    appealDetailsSection: appealDetailsSection
  };
}

export {
  getAppealApplicationHistory,
  getTimeExtensionsEvents,
  constructSection
};
