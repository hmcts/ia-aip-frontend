import { Request } from 'express';
import _ from 'lodash';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { getDeadline } from './event-deadline-date-finder';
import { hasInflightTimeExtension } from './utils';

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
    descriptionParagraphsAskForMoreTime: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.descriptionAskForMoreTime
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
      respondByText: i18n.pages.overviewPage.doThisNext.respondByText,
      respondByTextAskForMoreTime: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.respondByTextAskForMoreTime
    },
    allowedAskForMoreTime: true
  },
  'awaitingReasonsForAppealPartial': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description
    ],
    descriptionParagraphsAskForMoreTime: [
      i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.descriptionAskForMoreTime
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
      respondByText: i18n.pages.overviewPage.doThisNext.respondByText,
      respondByTextAskForMoreTime: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.respondByTextAskForMoreTime
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
  },
  'awaitingClarifyingQuestionsAnswers': {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.clarifyingQuestions.description
    ],
    descriptionParagraphsAskForMoreTime: [
      i18n.pages.overviewPage.doThisNext.clarifyingQuestions.descriptionAskForMoreTime
    ],
    info: null,
    cta: {
      url: paths.awaitingClarifyingQuestionsAnswers.questionsList,
      respondByText: i18n.pages.overviewPage.doThisNext.clarifyingQuestions.respondByText,
      respondByTextAskForMoreTime: i18n.pages.overviewPage.doThisNext.clarifyingQuestions.respondByTextAskForMoreTime
    },
    allowedAskForMoreTime: true
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

  doThisNextSection.deadline = getDeadline(currentAppealStatus, history, req);

  return doThisNextSection;
}

export {
  getAppealApplicationNextStep
};
