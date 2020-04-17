import { Request } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { SecurityHeaders } from '../service/authentication-service';
import UpdateAppealService from '../service/update-appeal-service';
import { dayMonthYearFormat } from './date-formats';
import { getDeadline } from './event-deadline-date-finder';

const APPEAL_STATE = {
  'appealStarted': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions,
      i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
    ],
    info: null,
    cta: {
      url: paths.appealStarted.taskList,
      respondByText: null
    },
    allowedAskForMoreTime: false
  },
  'appealStartedPartial': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions,
      i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
    ],
    info: null,
    cta: {
      url: paths.appealStarted.taskList,
      respondByText: null
    },
    allowedAskForMoreTime: false
  },
  'appealSubmitted': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealSubmitted.detailsSent,
      i18n.pages.overviewPage.doThisNext.appealSubmitted.dueDate
    ],
    info: {
      title: i18n.pages.overviewPage.doThisNext.appealSubmitted.info.title,
      url: i18n.pages.overviewPage.doThisNext.appealSubmitted.info.url
    },
    cta: null,
    allowedAskForMoreTime: false
  },
  'awaitingRespondentEvidence': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.detailsSent,
      i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.dueDate
    ],
    info: {
      title: i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.info.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.info.url
    },
    cta: null,
    allowedAskForMoreTime: false
  },
  'awaitingReasonsForAppeal': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.description
    ],
    info: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.url
    },
    usefulDocuments: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.url
    },
    cta: {
      url: paths.awaitingReasonsForAppeal.decision,
      respondByText: i18n.pages.overviewPage.doThisNext.respondByText
    },
    allowedAskForMoreTime: true
  },
  'awaitingReasonsForAppealPartial': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description
    ],
    info: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.info.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.info.url
    },
    usefulDocuments: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.usefulDocuments.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.usefulDocuments.url
    },
    cta: {
      url: paths.awaitingReasonsForAppeal.decision,
      respondByText: i18n.pages.overviewPage.doThisNext.respondByText
    },
    allowedAskForMoreTime: true
  },
  'reasonsForAppealSubmitted': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.reasonsForAppealSubmitted.detailsSent,
      i18n.pages.overviewPage.doThisNext.reasonsForAppealSubmitted.dueDate
    ],
    cta: null,
    allowedAskForMoreTime: false
  }
};

/**
 * Determines whether a status is partially completed by looking at the first possible user input property.
 * @param req the request containing the session
 * @param currentAppealStatus the current appeal status.
 */
function isPartiallySavedAppeal(req: Request, currentAppealStatus: string) {
  switch (currentAppealStatus) {
    case 'appealStarted': {
      return _.has(req.session.appeal, 'application.homeOfficeRefNumber');
    }
    case 'awaitingReasonsForAppeal': {
      return _.has(req.session.appeal, 'reasonsForAppeal.applicationReason');
    }
    default: {
      return false;
    }
  }
}

/**
 * Retrieves the information required based on appeal state also known as 'Do This Next' section
 * In the case of Partially saved appeal it will append 'Partial' to the current state
 * e.g 'awaitingReasonsForAppealPartial' which should be defined in APPEAL_STATE.
 * @param req the request containing the session and appeal status
 */
function getAppealApplicationNextStep(req: Request) {
  let currentAppealStatus = req.session.appeal.appealStatus;

  if (isPartiallySavedAppeal(req, currentAppealStatus)) {
    currentAppealStatus = currentAppealStatus + 'Partial';
  }

  let doThisNextSection = APPEAL_STATE[currentAppealStatus];

  // Added the following to avoid app crashing on events that are to be implemented.
  if (doThisNextSection === undefined) {
    doThisNextSection = {
      descriptionParagraphs: [
        `Description for event <b>${currentAppealStatus}</b> not found`
      ]
    };
  }

  // TODO: Remove this, should get history from the session and loaded at login from events endpoint in ccd
  const history = {
    appealStarted: {
      event: 'appealStarted',
      date: req.session.appeal.appealCreatedDate
    },
    appealSubmitted: {
      event: 'appealSubmitted',
      date: req.session.appeal.appealLastModified
    },
    submitReasonsForAppeal: {
      event: 'submitReasonsForAppeal',
      date: req.session.appeal.appealLastModified
    }
  };

  const directions = req.session.appeal.directions;
  doThisNextSection.deadline = getDeadline(currentAppealStatus, directions, history);
  return doThisNextSection;
}

function constructEventObject(event) {
  const formattedDate = moment(event.date).format(dayMonthYearFormat);
  return {
    date: `${formattedDate}`,
    title: i18n.pages.overviewPage.timeline[event.id].title,
    text: i18n.pages.overviewPage.timeline[event.id].text,
    links: i18n.pages.overviewPage.timeline[event.id].links
  };
}

async function getAppealApplicationHistory(req: Request, updateAppealService: UpdateAppealService) {
  const authenticationService = updateAppealService.getAuthenticationService();
  const headers: SecurityHeaders = await authenticationService.getSecurityHeaders(req);
  const ccdService = updateAppealService.getCcdService();
  const history = await ccdService.getCaseHistory(req.idam.userDetails.uid, req.session.ccdCaseId, headers);

  req.session.appeal.history = history;
  const eventToLookFor = [ 'submitAppeal', 'submitReasonsForAppeal' ];
  const eventsCollected = [];
  eventToLookFor.forEach((event: string,index: number) => {
    const eventFound = history.find((e: HistoryEvent) => event === e.id);
    if (eventFound) {
      let eventObject = constructEventObject(eventFound);
      // TODO - CLEAN UP CHECKING FOR TCW LINK
      const { appealStatus } = req.session.appeal;
      if ((['awaitingRespondentEvidence', 'appealSubmitted'].includes(appealStatus)) && event === 'submitAppeal') {
        delete eventObject.links[1];
      }
      eventsCollected.push(eventObject);
    }
  });

  return eventsCollected;
}

export {
  getAppealApplicationNextStep,
  getAppealApplicationHistory
};
