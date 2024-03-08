import { Request } from 'express';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { FEATURE_FLAGS } from '../data/constants';
import { Events } from '../data/events';
import { States } from '../data/states';
import { paths } from '../paths';
import { SecurityHeaders } from '../service/authentication-service';
import LaunchDarklyService from '../service/launchDarkly-service';
import UpdateAppealService from '../service/update-appeal-service';
import {
  getAppellantApplications,
  getApplicant,
  getFtpaApplicantType,
  getLatestUpdateTribunalDecisionHistory,
  isFtpaFeatureEnabled,
  isNonStandardDirectionEnabled,
  isReadonlyApplicationEnabled,
  isUpdateTribunalDecideWithRule31,
  isUpdateTribunalDecideWithRule32
} from './utils';

/**
 * Construct an event object used in the sections, pulls the content of the event from the translations file.
 * @param event the event containing the date and id.
 * @param req the request containing the session to update the timeExtensionsMap
 */
function constructEventObject(event: HistoryEvent, req: Request) {

  let eventContent = i18n.pages.overviewPage.timeline[event.id];
  if (isUploadEvidenceEventByLegalRep(req, event)) {
    eventContent = i18n.pages.overviewPage.timeline[event.id]['providedByLr'];
  } else if (Events.RESIDENT_JUDGE_FTPA_DECISION.id === event.id
      || Events.LEADERSHIP_JUDGE_FTPA_DECISION.id === event.id
      || Events.DECIDE_FTPA_APPLICATION.id === event.id) {
    const ftpaApplicantType = getFtpaApplicantType(req.session.appeal);
    eventContent = i18n.pages.overviewPage.timeline['decideFtpa'][ftpaApplicantType];
  }

  let eventObject = eventContent
      ? {
        date: moment(event.createdDate).format('DD MMMM YYYY'),
        dateObject: new Date(event.createdDate),
        text: eventContent.text || null,
        links: eventContent.links
      } : null;

  if (event.id === Events.RECORD_OUT_OF_TIME_DECISION.id) {
    eventObject.text = i18n.pages.overviewPage.timeline[event.id].type[req.session.appeal.outOfTimeDecisionType];
  }
  if (event.id === Events.REQUEST_RESPONSE_REVIEW.id) {
    eventObject.links[0].text = i18n.pages.overviewPage.timeline[event.id].status[req.session.appeal.appealReviewOutcome].text;
    eventObject.links[0].href = i18n.pages.overviewPage.timeline[event.id].status[req.session.appeal.appealReviewOutcome].href;
  }
  if (event.id === Events.SEND_DECISION_AND_REASONS.id) {
    if (req.session.appeal.updatedAppealDecision) {
      eventObject.links[0].href = i18n.pages.overviewPage.timeline[event.id].updatedLinks;
    } else {
      eventObject.links[0].href = i18n.pages.overviewPage.timeline[event.id].originalLinks;
    }
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

  return filteredEvents
      .map(event => constructEventObject(event, req));
}

function getApplicationEvents(req: Request): any[] {
  const applicationEvents = isReadonlyApplicationEnabled(req)
      ? req.session.appeal.makeAnApplications
      : getAppellantApplications(req.session.appeal.makeAnApplications);
  const makeDirectionsFlatMap = applicationEvents ? applicationEvents.flatMap(application => {
    const makeAnApplicationContent = i18n.pages.overviewPage.timeline.makeAnApplication[getApplicant(application.value)];
    const request = {
      id: application.id,
      date: moment(application.value.date).format('DD MMMM YYYY'),
      dateObject: new Date(application.value.date),
      text: makeAnApplicationContent.text,
      links: [{
        ...makeAnApplicationContent.links[0],
        href: `${makeAnApplicationContent.links[0].href}/${application.id}`
      }]
    };
    if (application.value.decision !== 'Pending') {
      const decideAnApplicationContent = i18n.pages.overviewPage.timeline.decideAnApplication[getApplicant(application.value)];
      const decision = {
        id: application.id,
        date: moment(application.value.decisionDate).format('DD MMMM YYYY'),
        dateObject: new Date(application.value.decisionDate),
        text: decideAnApplicationContent[application.value.decision],
        links: [{
          ...decideAnApplicationContent.links[0],
          href: `${decideAnApplicationContent.links[0].href}/${application.id}`
        }]
      };
      return [decision, request];
    }
    return [request];
  }) : [];
  return makeDirectionsFlatMap;
}

function getSubmitClarifyingQuestionsEvents(history: HistoryEvent[], directions: Direction[]): any[] {
  const submitCQHistory = history.filter(event => event.id === Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS.id);
  const directionsFiltered = directions.filter(direction => direction.tag === 'requestClarifyingQuestions');
  if (directionsFiltered.length > submitCQHistory.length) directionsFiltered.shift();

  if (!submitCQHistory && !directionsFiltered) return [];
  return submitCQHistory.map(event => {
    return {
      date: moment(event.createdDate).format('DD MMMM YYYY'),
      dateObject: new Date(event.createdDate),
      text: i18n.pages.overviewPage.timeline[event.id].text || null,
      links: [{
        ...i18n.pages.overviewPage.timeline[event.id].links[0],
        href: i18n.pages.overviewPage.timeline[event.id].links[0].href.replace(':id', directionsFiltered.shift().uniqueId)
      }]
    };
  });
}

function getDirectionHistory(req: Request): any[] {
  if (isNonStandardDirectionEnabled(req)) {
    return (req.session.appeal.directions || [])
        .filter(direction => (
            direction.directionType === 'sendDirection'
            && (direction.parties === 'appellant' || direction.parties === 'respondent')))
        .map(direction => {
          return {
            date: moment(direction.dateSent).format('DD MMMM YYYY'),
            dateObject: new Date(direction.dateSent),
            text: i18n.pages.overviewPage.timeline.sendDirection[direction.parties].text || null,
            links: [{
              ...i18n.pages.overviewPage.timeline.sendDirection[direction.parties].links[0],
              href: paths.common.directionHistoryViewer.replace(':id', direction.uniqueId)
            }]
          };
        });
  } else {
    return [];
  }
}

function getUpdateTribunalDecisionHistory(req: Request, ftpaSetAsideFeatureEnabled: boolean): any[] {
  let latestUpdateTribunalDecisionHistory = getLatestUpdateTribunalDecisionHistory(req, ftpaSetAsideFeatureEnabled);

  if (isUpdateTribunalDecideWithRule31(req, ftpaSetAsideFeatureEnabled)) {

    let originalTribunalDecision = req.session.appeal.isDecisionAllowed && req.session.appeal.isDecisionAllowed.toLowerCase() || null;
    let updatedAppealDecision = req.session.appeal.updatedAppealDecision && req.session.appeal.updatedAppealDecision.toLowerCase() || null;
    let timelineText = '';

    if (originalTribunalDecision === 'allowed' && updatedAppealDecision === 'dismissed') {
      timelineText = i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule31.fromAllowedToDismissedText;
    } else if (originalTribunalDecision === 'dismissed' && updatedAppealDecision === 'allowed') {
      timelineText = i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule31.fromDismissedToAllowedText;
    } else {
      return [];
    }

    return [{
      date: moment(latestUpdateTribunalDecisionHistory.createdDate).format('DD MMMM YYYY'),
      dateObject: new Date(latestUpdateTribunalDecisionHistory.createdDate),
      text: timelineText || null
    }];
  } else if (isUpdateTribunalDecideWithRule32(req, ftpaSetAsideFeatureEnabled)) {

    return [{
      date: moment(latestUpdateTribunalDecisionHistory.createdDate).format('DD MMMM YYYY'),
      dateObject: new Date(latestUpdateTribunalDecisionHistory.createdDate),
      text: i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule32.documentOfReasonsForTheDecision.text || null,
      links: [{
        ...i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule32.documentOfReasonsForTheDecision.links[0],
        href: i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule32.documentOfReasonsForTheDecision.links[0].href
      }]
    }];
  } else {
    return [];
  }
}

function getUpdateTribunalDecisionDocumentHistory(req: Request, ftpaSetAsideFeatureEnabled: boolean): any[] {
  if (isUpdateTribunalDecideWithRule31(req, ftpaSetAsideFeatureEnabled) && req.session.appeal.updateTribunalDecisionAndReasonsFinalCheck === 'Yes') {

    let latestUpdateTribunalDecisionHistory = getLatestUpdateTribunalDecisionHistory(req, ftpaSetAsideFeatureEnabled);

    return [{
      date: moment(latestUpdateTribunalDecisionHistory.createdDate).format('DD MMMM YYYY'),
      dateObject: new Date(latestUpdateTribunalDecisionHistory.createdDate),
      text: i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule31.newDecisionAndReasonsDocument.text || null,
      links: [{
        ...i18n.pages.overviewPage.timeline.updateTribunalDecision.underRule31.newDecisionAndReasonsDocument.links[0]
      }]
    }];
  } else {
    return [];
  }
}

async function getAppealApplicationHistory(req: Request, updateAppealService: UpdateAppealService) {
  const authenticationService = updateAppealService.getAuthenticationService();
  const headers: SecurityHeaders = await authenticationService.getSecurityHeaders(req);
  const ccdService = updateAppealService.getCcdService();
  req.session.appeal.history = await ccdService.getCaseHistory(req.idam.userDetails.uid, req.session.appeal.ccdCaseId, headers);

  const uploadAddendumEvidenceFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false);
  const hearingBundleFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_BUNDLE, false);
  const ftpaFeatureEnabled: boolean = await isFtpaFeatureEnabled(req);
  const ftpaSetAsideFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_SETASIDE_FEATURE_FLAG, false);
  const eventsAndStates = getEventsAndStates(uploadAddendumEvidenceFeatureEnabled, hearingBundleFeatureEnabled, ftpaFeatureEnabled, ftpaSetAsideFeatureEnabled);

  const appealDecisionSection = constructSection(eventsAndStates.appealDecisionSectionEvents, req.session.appeal.history, null, req);
  const appealHearingRequirementsSection = constructSection(
    eventsAndStates.appealHearingRequirementsSectionEvents,
    req.session.appeal.history.filter(event =>
      ![Events.UPLOAD_ADDITIONAL_EVIDENCE.id, Events.UPLOAD_ADDENDUM_EVIDENCE_LEGAL_REP.id].includes(event.id)
      || isUploadEvidenceEventByLegalRep(req, event)),
    null, req
  );
  const appealArgumentSection = constructSection(
    eventsAndStates.appealArgumentSectionEvents,
    req.session.appeal.history.filter(event => !isUploadEvidenceEventByLegalRep(req, event)),
    eventsAndStates.appealArgumentSectionStates, req
  );
  const appealDetailsSection = constructSection(eventsAndStates.appealDetailsSectionEvents, req.session.appeal.history, null, req);

  const applicationEvents = getApplicationEvents(req);
  const submitCQHistory = getSubmitClarifyingQuestionsEvents(req.session.appeal.history, req.session.appeal.directions || []);
  const { paymentStatus, paAppealTypeAipPaymentOption = null, paymentDate } = req.session.appeal;
  let paymentEvent = [];
  if (paymentStatus === 'Paid') {
    paymentEvent = [{
      date: moment(paymentDate).format('DD MMMM YYYY'),
      dateObject: new Date(paymentDate),
      text: i18n.pages.overviewPage.timeline.paymentAppeal.text || null,
      links: i18n.pages.overviewPage.timeline.paymentAppeal.links
    }];
  }

  const directionsHistory = getDirectionHistory(req);

  const argumentSection = appealArgumentSection.concat(applicationEvents, paymentEvent, submitCQHistory, directionsHistory)
    .sort((a: any, b: any) => b.dateObject - a.dateObject);

  const updatedTribunalDecisionHistory = getUpdateTribunalDecisionHistory(req, ftpaSetAsideFeatureEnabled);
  const updatedTribunalDecisionDocumentHistory = getUpdateTribunalDecisionDocumentHistory(req, ftpaSetAsideFeatureEnabled);
  const combinedAppealDecisionSection = appealDecisionSection.concat(updatedTribunalDecisionHistory, updatedTribunalDecisionDocumentHistory)
    .sort((a: any, b: any) => b.dateObject - a.dateObject);

  return {
    ...(combinedAppealDecisionSection && combinedAppealDecisionSection.length > 0) &&
    { appealDecisionSection: combinedAppealDecisionSection },
    ...(appealHearingRequirementsSection && appealHearingRequirementsSection.length > 0) &&
    { appealHearingRequirementsSection: appealHearingRequirementsSection },
    appealArgumentSection: argumentSection,
    appealDetailsSection: appealDetailsSection
  };
}

function getEventsAndStates(uploadAddendumEvidenceFeatureEnabled: boolean,
  hearingBundleFeatureEnabled: boolean,
  ftpaFeatureEnabled: boolean,
  ftpaSetAsideFeatureEnabled: boolean) {
  const appealHearingRequirementsSectionEvents = [
    Events.SUBMIT_AIP_HEARING_REQUIREMENTS.id,
    Events.STITCHING_BUNDLE_COMPLETE.id,
    Events.UPLOAD_ADDITIONAL_EVIDENCE.id
  ];
  const appealArgumentSectionEvents = [
    Events.UPLOAD_ADDITIONAL_EVIDENCE.id,
    Events.SUBMIT_REASONS_FOR_APPEAL.id,
    Events.BUILD_CASE.id,
    Events.REQUEST_RESPONDENT_REVIEW.id,
    Events.REQUEST_RESPONDENT_REVIEW.id,
    Events.REQUEST_RESPONSE_REVIEW.id,
    Events.SUBMIT_CMA_REQUIREMENTS.id,
    Events.LIST_CMA.id,
    Events.REQUEST_HEARING_REQUIREMENTS_FEATURE.id,
    Events.END_APPEAL.id,
    Events.END_APPEAL_AUTOMATICALLY.id,
    Events.RECORD_OUT_OF_TIME_DECISION.id
  ];
  const appealDecisionSectionEvents = [Events.SEND_DECISION_AND_REASONS.id];

  if (ftpaFeatureEnabled) {
    appealDecisionSectionEvents.push(
        Events.APPLY_FOR_FTPA_APPELLANT.id,
        Events.APPLY_FOR_FTPA_RESPONDENT.id,
        Events.LEADERSHIP_JUDGE_FTPA_DECISION.id,
        Events.RESIDENT_JUDGE_FTPA_DECISION.id
    );
  }

  if (ftpaSetAsideFeatureEnabled) {
    appealDecisionSectionEvents.push(
        Events.DECIDE_FTPA_APPLICATION.id
    );
  }

  const appealDetailsSectionEvents = [Events.SUBMIT_APPEAL.id, Events.PAY_AND_SUBMIT_APPEAL.id];
  const appealArgumentSectionStates = [
    States.APPEAL_SUBMITTED.id,
    States.CLARIFYING_QUESTIONS_SUBMITTED.id,
    States.REASONS_FOR_APPEAL_SUBMITTED.id,
    States.CASE_UNDER_REVIEW.id,
    States.AWAITING_REASONS_FOR_APPEAL.id,
    States.RESPONDENT_REVIEW.id,
    States.AWAITING_CLARIFYING_QUESTIONS.id,
    States.CMA_REQUIREMENTS_SUBMITTED.id,
    States.CMA_LISTED.id,
    States.SUBMIT_HEARING_REQUIREMENTS.id,
    States.ENDED.id
  ];

  if (hearingBundleFeatureEnabled) {
    appealHearingRequirementsSectionEvents.push(Events.LIST_CASE.id);
  }

  if (uploadAddendumEvidenceFeatureEnabled) {
    appealArgumentSectionEvents.push(
      Events.UPLOAD_ADDENDUM_EVIDENCE_LEGAL_REP.id,
      Events.UPLOAD_ADDENDUM_EVIDENCE_HOME_OFFICE.id,
      Events.UPLOAD_ADDENDUM_EVIDENCE.id,
      Events.UPLOAD_ADDENDUM_EVIDENCE_ADMIN_OFFICER.id
    );

    appealHearingRequirementsSectionEvents.push(Events.UPLOAD_ADDENDUM_EVIDENCE_LEGAL_REP.id);

    appealArgumentSectionStates.push(States.PRE_HEARING.id, States.DECISION.id, States.DECIDED.id);
  }

  return {
    appealArgumentSectionEvents,
    appealHearingRequirementsSectionEvents,
    appealDecisionSectionEvents,
    appealDetailsSectionEvents,
    appealArgumentSectionStates
  };
}

function isUploadEvidenceEventByLegalRep(req: Request, event: HistoryEvent) {
  return [
    Events.UPLOAD_ADDITIONAL_EVIDENCE.id,
    Events.UPLOAD_ADDENDUM_EVIDENCE_LEGAL_REP.id
  ].includes(event.id) && event.user.id !== req.idam.userDetails.uid;
}

export {
  getAppealApplicationHistory,
  getSubmitClarifyingQuestionsEvents,
  getApplicationEvents,
  getDirectionHistory,
  getUpdateTribunalDecisionHistory,
  getUpdateTribunalDecisionDocumentHistory,
  constructSection,
  getEventsAndStates
};
