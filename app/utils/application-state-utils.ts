import { Request } from 'express';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
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

/**
 * Retrieves the information required based on appeal state also known as 'Do This Next' section
 * @param req the request containing the session and appeal status
 */
function getAppealApplicationNextStep(req: Request) {
  const currentAppealStatus = req.session.appeal.appealStatus;
  const doThisNextSection = APPEAL_STATE[currentAppealStatus];

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
