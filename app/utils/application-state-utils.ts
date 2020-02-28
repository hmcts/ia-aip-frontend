import { Request } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { SecurityHeaders } from '../service/authentication-service';
import UpdateAppealService from '../service/update-appeal-service';
import { getDeadline } from './event-deadline-date-finder';

const APPEAL_STATE = {
  'appealStarted': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions,
      i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
    ],
    info: {
      title: null,
      url: null
    },
    cta: paths.taskList
  },
  'appealStartedPartial': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions,
      i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
    ],
    info: {
      title: null,
      url: null
    },
    cta: paths.taskList
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
    cta: null
  }
};

function isPartiallySavedAppeal(req: Request, currentAppealStatus: string) {
  switch (currentAppealStatus) {
    case 'appealStarted': {
      return _.has(req.session.appeal, 'application.homeOfficeRefNumber');
    }
    case 'awaitingReasonsForAppeal': {
      return _.has(req.session.appeal, 'caseBuilding.decision');
    }
    default: {
      return false;
    }
  }
}

/**
 * Retrieves the information required based on appeal state also known as 'Do This Next' section
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
        `Description for event <span  class='govuk-body govuk-!-font-weight-bold'> ${currentAppealStatus}</span>  not found`
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
    }
  };

  doThisNextSection.deadline = getDeadline(currentAppealStatus, history);

  return doThisNextSection;
}

function constructEventObject(event) {
  const formattedDate = moment(event.date).format('DD MMMM YYYY');
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
  eventToLookFor.forEach((event: string) => {
    const eventFound = history.find((e: EventHistory) => event === e.id);
    if (eventFound) {
      const eventObject = constructEventObject(eventFound);
      eventsCollected.push(eventObject);
    }
  });

  return eventsCollected;
}

export {
  getAppealApplicationNextStep,
  getAppealApplicationHistory
};
