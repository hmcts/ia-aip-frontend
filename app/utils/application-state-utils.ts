import { Request } from 'express';
import _ from 'lodash';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { getDeadline } from './event-deadline-date-finder';

const APPEAL_STATE = {
  'appealStarted': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions,
      i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
    ],
    info: null,
    cta: {
      url: paths.taskList,
      respondByText: null
    }
  },
  'appealStartedPartial': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions,
      i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
    ],
    info: null,
    cta: {
      url: paths.taskList,
      respondByText: null
    }
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
  },
  'awaitingReasonsForAppeal': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.tellUsWhy
    ],
    info: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.info.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.info.url
    },
    usefulDocuments: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.usefulDocuments.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.usefulDocuments.url
    },
    cta: {
      url: paths.reasonsForAppeal.decision,
      respondByText: i18n.pages.overviewPage.doThisNext.respondByText
    }
  },
  'awaitingReasonsForAppealPartial': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partiallySaved
    ],
    info: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.info.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.info.url
    },
    usefulDocuments: {
      title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.usefulDocuments.title,
      url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.usefulDocuments.url
    },
    cta: {
      url: paths.reasonsForAppeal.decision,
      respondByText: i18n.pages.overviewPage.doThisNext.respondByText
    }
  },
  'reasonsForAppealSubmitted': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.reasonsForAppealSubmitted.detailsSent,
      i18n.pages.overviewPage.doThisNext.reasonsForAppealSubmitted.dueDate
    ],
    cta: null
  }
};

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
    }
  };

  doThisNextSection.deadline = getDeadline(currentAppealStatus, history);

  return doThisNextSection;
}

function getAppealApplicationHistory() {
  // TODO:
  return null;
}

export {
  getAppealApplicationNextStep,
  getAppealApplicationHistory
};
