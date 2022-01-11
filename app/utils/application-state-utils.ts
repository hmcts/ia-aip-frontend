import { Request } from 'express';
import _ from 'lodash';
import i18n from '../../locale/en.json';
import { Events } from '../data/events';
import { States } from '../data/states';
import { paths } from '../paths';
import { hasPendingTimeExtension } from '../utils/utils';
import { getHearingCentre, getHearingCentreEmail, getHearingDate, getHearingTime } from './cma-hearing-details';
import { getDeadline } from './event-deadline-date-finder';

interface DoThisNextSection {
  descriptionParagraphs: string[];
  usefulDocuments?: {
    title: string;
    url: string;
  };
  info?: {
    title: string,
    url: string;
  };
  cta?: {
    url?: string;
    respondBy?: string,
    respondByText?: string,
    respondByTextAskForMoreTime?: string;
    ctaTitle?: string;
  };
  allowedAskForMoreTime?: boolean;
  deadline?: string;
  date?: string;
  time?: string;
  hearingCentre?: string;
  hearingCentreEmail?: string;
  removeAppealFromOnlineReason?: string;
  removeAppealFromOnlineDate?: string;
}

/**
 * Returns the appeal status, overrides status if the appeal is late .
 * @param req the request containing the session and appeal status
 */
function getAppealStatus(req: Request) {
  if (req.session.appeal.application.isAppealLate && req.session.appeal.appealStatus !== States.ENDED.id) {
    if (req.session.appeal.outOfTimeDecisionType === 'rejected') {
      return 'lateAppealRejected';
    }
    if (req.session.appeal.appealStatus === 'appealSubmitted') {
      return 'lateAppealSubmitted';
    }
    return req.session.appeal.appealStatus;
  } else if (req.session.appeal.appealStatus === States.APPEAL_STARTED.id) {
    return _.has(req.session.appeal, 'application.homeOfficeRefNumber') ? `${req.session.appeal.appealStatus}Partial` : req.session.appeal.appealStatus;
  } else if (req.session.appeal.appealStatus === States.AWAITING_REASONS_FOR_APPEAL.id) {
    return _.has(req.session.appeal, 'reasonsForAppeal.applicationReason') ? `${req.session.appeal.appealStatus}Partial` : req.session.appeal.appealStatus;
  } else if (req.session.appeal.appealStatus === States.RESPONDENT_REVIEW.id) {
    if (req.session.appeal.history.find(event => event.id === Events.REQUEST_RESPONSE_REVIEW.id)) {
      return req.session.appeal.appealReviewOutcome;
    }
    return req.session.appeal.appealStatus;
  } else {
    return req.session.appeal.appealStatus;
  }
}

/**
 * Returns the reason for moving an appeal offline.
 * @param req the request containing the session and appeal status
 */
function getMoveAppealOfflineReason(req: Request) {
  return req.session.appeal.removeAppealFromOnlineReason;
}

/**
 * Returns the date an appeal is moved offline.
 * @param req the request containing the session and appeal status
 */
function getMoveAppealOfflineDate(req: Request) {
  return req.session.appeal.removeAppealFromOnlineDate;
}

/**
 * Retrieves the information required based on appeal state also known as 'Do This Next' section
 * In the case of Partially saved appeal it will append 'Partial' to the current state
 * e.g 'awaitingReasonsForAppealPartial' which should be defined in APPEAL_STATE.
 * @param req the request containing the session and appeal status
 */
function getAppealApplicationNextStep(req: Request) {
  const currentAppealStatus = getAppealStatus(req);
  const pendingTimeExtension = hasPendingTimeExtension(req.session.appeal);
  const decisionGranted = req.session.appeal.makeAnApplications && req.session.appeal.makeAnApplications[0].value.decision === 'Granted' || null;
  const decisionRefused = req.session.appeal.makeAnApplications && req.session.appeal.makeAnApplications[0].value.decision === 'Refused' || null;
  let doThisNextSection: DoThisNextSection;

  let descriptionParagraphs;
  let respondBy;
  switch (currentAppealStatus) {
    case 'appealStarted':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions,
          i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
        ],
        info: null,
        cta: {
          url: paths.appealStarted.taskList
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'appealStartedPartial':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions,
          i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
        ],
        info: null,
        cta: {
          url: paths.appealStarted.taskList
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'appealSubmitted':
      doThisNextSection = {
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
      };
      break;
    case 'draftHearingRequirements':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.draftHearingRequirements.detailsSent,
          i18n.pages.overviewPage.doThisNext.draftHearingRequirements.dueDate
        ],
        info: {
          title: i18n.pages.overviewPage.doThisNext.draftHearingRequirements.info.title,
          url: i18n.pages.overviewPage.doThisNext.draftHearingRequirements.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'lateAppealSubmitted':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.lateAppealSubmitted.detailsSent,
          i18n.pages.overviewPage.doThisNext.lateAppealSubmitted.dueDate
        ],
        info: {
          title: i18n.pages.overviewPage.doThisNext.appealSubmitted.info.title,
          url: i18n.pages.overviewPage.doThisNext.appealSubmitted.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'awaitingRespondentEvidence':
      doThisNextSection = {
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
      };
      break;
    case 'lateAppealRejected':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.lateAppealRejected.description,
          i18n.pages.overviewPage.doThisNext.lateAppealRejected.description2
        ],
        cta: {
          url: null,
          respondByText: null
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'awaitingReasonsForAppeal':
      descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.description];
      respondBy = i18n.pages.overviewPage.doThisNext.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.descriptionAskForMoreTime];
        respondBy = i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = i18n.pages.overviewPage.doThisNext.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = i18n.pages.overviewPage.doThisNext.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
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
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'awaitingReasonsForAppealPartial':
      descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description];
      respondBy = i18n.pages.overviewPage.doThisNext.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.descriptionAskForMoreTime];
        respondBy = i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = i18n.pages.overviewPage.doThisNext.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = i18n.pages.overviewPage.doThisNext.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
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
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'reasonsForAppealSubmitted':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.reasonsForAppealSubmitted.detailsSent,
          i18n.pages.overviewPage.doThisNext.reasonsForAppealSubmitted.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'respondentReview':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.respondentReview.detailsSent,
          i18n.pages.overviewPage.doThisNext.respondentReview.dueDate
        ],
        info: i18n.pages.overviewPage.doThisNext.respondentReview.info
      };
      break;
    case 'decisionWithdrawn':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.decisionWithdrawn.detailsSent,
          i18n.pages.overviewPage.doThisNext.decisionWithdrawn.dueDate
        ],
        info: i18n.pages.overviewPage.doThisNext.decisionWithdrawn.info,
        cta: {},
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'decisionMaintained':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.decisionMaintained.description,
          i18n.pages.overviewPage.doThisNext.decisionMaintained.description2,
          i18n.pages.overviewPage.doThisNext.decisionMaintained.dueDate
        ],
        info: i18n.pages.overviewPage.doThisNext.decisionMaintained.info,
        cta: {},
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'awaitingClarifyingQuestionsAnswersPartial':
    case 'awaitingClarifyingQuestionsAnswers':
      descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.clarifyingQuestions.description];
      respondBy = i18n.pages.overviewPage.doThisNext.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.clarifyingQuestions.descriptionAskForMoreTime];
        respondBy = i18n.pages.overviewPage.doThisNext.clarifyingQuestions.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = i18n.pages.overviewPage.doThisNext.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = i18n.pages.overviewPage.doThisNext.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: null,
        cta: {
          url: paths.awaitingClarifyingQuestionsAnswers.questionsList,
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'awaitingCmaRequirements':
      descriptionParagraphs = [
        i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.description,
        i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.description2
      ];
      respondBy = i18n.pages.overviewPage.doThisNext.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.descriptionAskForMoreTime];
        respondBy = i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = i18n.pages.overviewPage.doThisNext.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = i18n.pages.overviewPage.doThisNext.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.info.title,
          url: i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.info.url
        },
        cta: {
          url: paths.awaitingCmaRequirements.taskList,
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'submitHearingRequirements':
      descriptionParagraphs = [
        i18n.pages.overviewPage.doThisNext.submitHearingRequirements.description,
        i18n.pages.overviewPage.doThisNext.submitHearingRequirements.description2
      ];
      respondBy = i18n.pages.overviewPage.doThisNext.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [i18n.pages.overviewPage.doThisNext.submitHearingRequirements.descriptionAskForMoreTime];
        respondBy = i18n.pages.overviewPage.doThisNext.submitHearingRequirements.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = i18n.pages.overviewPage.doThisNext.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = i18n.pages.overviewPage.doThisNext.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: i18n.pages.overviewPage.doThisNext.submitHearingRequirements.info.title,
          url: i18n.pages.overviewPage.doThisNext.submitHearingRequirements.info.url
        },
        cta: {
          url: paths.submitHearingRequirements.taskList,
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'clarifyingQuestionsAnswersSubmitted':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.clarifyingQuestionsAnswersSubmitted.description,
          i18n.pages.overviewPage.doThisNext.clarifyingQuestionsAnswersSubmitted.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'cmaAdjustmentsAgreed':
    case 'cmaRequirementsSubmitted':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.cmaRequirementsSubmitted.description,
          i18n.pages.overviewPage.doThisNext.cmaRequirementsSubmitted.description2
        ],
        info: {
          title: i18n.pages.overviewPage.doThisNext.cmaRequirementsSubmitted.info.title,
          url: i18n.pages.overviewPage.doThisNext.cmaRequirementsSubmitted.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'cmaListed':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.cmaListed.description,
          i18n.pages.overviewPage.doThisNext.cmaListed.date,
          i18n.pages.overviewPage.doThisNext.cmaListed.time,
          i18n.pages.overviewPage.doThisNext.cmaListed.hearingCentre,
          i18n.pages.overviewPage.doThisNext.cmaListed.respondByTextAskForMoreTime
        ],
        usefulDocuments: {
          title: i18n.pages.overviewPage.doThisNext.cmaListed.usefulDoc.title,
          url: i18n.pages.overviewPage.doThisNext.cmaListed.usefulDoc.url
        },
        info: {
          title: i18n.pages.overviewPage.doThisNext.cmaListed.usefulDocuments.title,
          url: i18n.pages.overviewPage.doThisNext.cmaListed.usefulDocuments.url
        },
        cta: null,
        allowedAskForMoreTime: false,
        date: getHearingDate(req),
        time: getHearingTime(req),
        hearingCentre: getHearingCentre(req)
      };
      break;
    case 'ended':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.ended.ctaInstruction,
          i18n.pages.overviewPage.doThisNext.ended.ctaReview,
          i18n.pages.overviewPage.doThisNext.ended.ctaContact,
          i18n.pages.overviewPage.doThisNext.ended.ctaFeedbackTitle,
          i18n.pages.overviewPage.doThisNext.ended.ctaFeedbackDescription
        ],
        cta: {
          url: null,
          ctaTitle: i18n.pages.overviewPage.doThisNext.ended.ctaTitle
        },
        allowedAskForMoreTime: false,
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'appealTakenOffline':
      doThisNextSection = {
        descriptionParagraphs: [
        ],
        info: {
          title: i18n.pages.overviewPage.doThisNext.appealTakenOffline.info.title,
          url: i18n.pages.overviewPage.doThisNext.appealTakenOffline.info.description
        },
        removeAppealFromOnlineReason: getMoveAppealOfflineReason(req),
        removeAppealFromOnlineDate: getMoveAppealOfflineDate(req)
      };
      break;
    default:
      // default message to avoid app crashing on events that are to be implemented.
      doThisNextSection = {
        descriptionParagraphs: [
          `Description for appeal status <b>${currentAppealStatus}</b> not found`
        ]
      };
      break;
  }
  doThisNextSection.deadline = getDeadline(currentAppealStatus, req);
  return doThisNextSection;
}

export {
  getAppealApplicationNextStep,
  getAppealStatus,
  getMoveAppealOfflineReason,
  getMoveAppealOfflineDate
};
