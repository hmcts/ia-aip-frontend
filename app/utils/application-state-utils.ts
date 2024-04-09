import { Request } from 'express';
import _ from 'lodash';
import i18n from '../../locale/en.json';
import { APPLICANT_TYPE, FEATURE_FLAGS } from '../data/constants';
import { Events } from '../data/events';
import { States } from '../data/states';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';
import {
  getAppellantApplications,
  getFtpaApplicantType,
  hasPendingTimeExtension,
  isFtpaFeatureEnabled,
  isUpdateTribunalDecideWithRule31,
  isUpdateTribunalDecideWithRule32
} from '../utils/utils';
import { getHearingCentre, getHearingCentreEmail, getHearingDate, getHearingTime } from './cma-hearing-details';
import { getDeadline, getDueDateForAppellantToRespondToFtpaDecision } from './event-deadline-date-finder';
import { convertToAmountOfMoneyDividedBy100, getFee } from './payments-utils';
import { appealHasRemissionOption, hasFeeRemissionDecision } from './remission-utils';

interface DoThisNextSection {
  descriptionParagraphs: string[];
  usefulDocuments?: {
    title: string;
    url: string;
  };
  info?: {
    title: string,
    text?: string,
    url: string;
  };
  cta?: {
    link?: {
      text: string,
      url: string
    },
    url?: string,
    respondBy?: string,
    respondByText?: string,
    respondByTextAskForMoreTime?: string,
    ctaTitle?: string
  };
  allowedAskForMoreTime?: boolean;
  deadline?: string;
  ftpaDeadline?: string;
  date?: string;
  time?: string;
  hearingCentre?: string;
  hearingCentreEmail?: string;
  removeAppealFromOnlineReason?: string;
  removeAppealFromOnlineDate?: string;
  decision?: string;
  feeForAppeal?: string;
  feeLeftToPay?: string;
  remissionRejectedDatePlus14days?: string;
}

/**
 * Returns the appeal status, overrides status if the appeal is late .
 * @param req the request containing the session and appeal status
 */
function getAppealStatus(req: Request) {
  if (req.session.appeal.appealStatus === States.FINAL_BUNDLING.id
    && req.session.appeal.history.find(event => event.id === Events.DECISION_WITHOUT_HEARING.id)) {
    return 'decidedWithoutHearing';
  } else if (req.session.appeal.application.isAppealLate && req.session.appeal.appealStatus !== States.ENDED.id) {
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
async function getAppealApplicationNextStep(req: Request) {
  const currentAppealStatus = getAppealStatus(req);
  const pendingTimeExtension = hasPendingTimeExtension(req.session.appeal);
  const applications = getAppellantApplications(req.session.appeal.makeAnApplications);
  const decisionGranted = applications.length > 0 && applications[0].value.decision === 'Granted' || null;
  const decisionRefused = applications.length > 0 && applications[0].value.decision === 'Refused' || null;
  let doThisNextSection: DoThisNextSection;
  const isLate = req.session.appeal.application.isAppealLate;
  const ftpaEnabled: boolean = await isFtpaFeatureEnabled(req);
  const ftpaApplicantType = getFtpaApplicantType(req.session.appeal);
  const ftpaSetAsideFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_SETASIDE_FEATURE_FLAG, false);
  const dlrmFeeRemissionFlag: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);

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
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
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
      }
      break;
    case 'listing':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
        const paragraphs = eventByLegalRep(req, Events.SUBMIT_AIP_HEARING_REQUIREMENTS.id, 'listing')
          ? [
            i18n.pages.overviewPage.doThisNext.listing.providedByLr.direction1,
            i18n.pages.overviewPage.doThisNext.listing.providedByLr.direction2,
            i18n.pages.overviewPage.doThisNext.listing.dueDate
          ]
          : [
            i18n.pages.overviewPage.doThisNext.listing.detailsSent,
            i18n.pages.overviewPage.doThisNext.listing.dueDate
          ];
        doThisNextSection = {
          descriptionParagraphs: paragraphs,
          info: {
            title: i18n.pages.overviewPage.doThisNext.listing.info.title,
            url: i18n.pages.overviewPage.doThisNext.listing.info.url
          },
          cta: null,
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'lateAppealSubmitted':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag &&
        requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = {
          descriptionParagraphs: [
            i18n.pages.overviewPage.doThisNext.lateAppealSubmittedDlrmFeeRemission.detailsSent,
            i18n.pages.overviewPage.doThisNext.lateAppealSubmittedDlrmFeeRemission.feeDetails,
            i18n.pages.overviewPage.doThisNext.lateAppealSubmittedDlrmFeeRemission.tribunalCheck,
            i18n.pages.overviewPage.doThisNext.lateAppealSubmittedDlrmFeeRemission.dueDate
          ],
          cta: null,
          allowedAskForMoreTime: false
        };
      } else {
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
      }
      break;
    case 'awaitingRespondentEvidence':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
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
      }
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
    case 'caseUnderReview':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            i18n.pages.overviewPage.doThisNext.caseUnderReview.detailsSent,
            i18n.pages.overviewPage.doThisNext.caseUnderReview.dueDate
          ],
          cta: null,
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'respondentReview':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            i18n.pages.overviewPage.doThisNext.respondentReview.detailsSent,
            i18n.pages.overviewPage.doThisNext.respondentReview.dueDate
          ],
          info: i18n.pages.overviewPage.doThisNext.respondentReview.info
        };
      }
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
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
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
      }
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
    case 'prepareForHearing':
    case 'finalBundling':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
        const hearingBundleFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_BUNDLE, false);
        if (!hearingBundleFeatureEnabled) {
          return {
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.nothingToDo
            ]
          };
        }
        const description = eventByLegalRep(req, Events.CREATE_CASE_SUMMARY.id, 'finalBundling')
          ? i18n.pages.overviewPage.doThisNext.prepareForHearing.providedByLr.description
          : i18n.pages.overviewPage.doThisNext.prepareForHearing.description;

        doThisNextSection = {
          descriptionParagraphs: [
            description,
            i18n.pages.overviewPage.doThisNext.prepareForHearing.date,
            i18n.pages.overviewPage.doThisNext.prepareForHearing.time,
            i18n.pages.overviewPage.doThisNext.prepareForHearing.hearingCentre,
            i18n.pages.overviewPage.doThisNext.prepareForHearing.hearingNotice
          ],
          info: {
            title: i18n.pages.overviewPage.doThisNext.prepareForHearing.info.title,
            url: i18n.pages.overviewPage.doThisNext.prepareForHearing.info.url
          },
          cta: {},
          allowedAskForMoreTime: false,
          date: getHearingDate(req),
          time: getHearingTime(req),
          hearingCentre: getHearingCentre(req)
        };
      }
      break;
    case 'decidedWithoutHearing':
      doThisNextSection = {
        descriptionParagraphs: i18n.pages.overviewPage.doThisNext.decidedWithoutHearing.description
      };
      break;
    case 'ended':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.ended.ctaInstruction,
          i18n.pages.overviewPage.doThisNext.ended.ctaReview
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
        descriptionParagraphs: [],
        info: {
          title: i18n.pages.overviewPage.doThisNext.appealTakenOffline.info.title,
          url: i18n.pages.overviewPage.doThisNext.appealTakenOffline.info.description
        },
        removeAppealFromOnlineReason: getMoveAppealOfflineReason(req),
        removeAppealFromOnlineDate: getMoveAppealOfflineDate(req)
      };
      break;
    case 'preHearing':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            i18n.pages.overviewPage.doThisNext.preHearing.hearingBundle,
            i18n.pages.overviewPage.doThisNext.preHearing.hearingBundleLink,
            i18n.pages.overviewPage.doThisNext.preHearing.hearingDetails,
            i18n.pages.overviewPage.doThisNext.preHearing.hearingDateTimeCentre
          ],
          info: {
            title: i18n.pages.overviewPage.doThisNext.preHearing.info.title,
            url: i18n.pages.overviewPage.doThisNext.preHearing.info.url
          }
        };
      }
      break;
    case 'decided':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph();
      } else {
        let decidedDescriptionParagraphs;
        let decidedInfo;
        let decision;

        if (ftpaEnabled) {
          decidedDescriptionParagraphs = [
            i18n.pages.overviewPage.doThisNext.decided.decision,
            i18n.pages.overviewPage.doThisNext.decided.descriptionFtpaEnabled
          ];

          decidedInfo = {
            title: i18n.pages.overviewPage.doThisNext.decided.info.titleFtpaEnabled,
            text: i18n.pages.overviewPage.doThisNext.decided.info.text,
            url: i18n.pages.overviewPage.doThisNext.decided.info.urlFtpaEnabled
          };

        } else {
          decidedDescriptionParagraphs = [
            i18n.pages.overviewPage.doThisNext.decided.decision,
            i18n.pages.overviewPage.doThisNext.decided.description
          ];

          decidedInfo = {
            title: i18n.pages.overviewPage.doThisNext.decided.info.title,
            url: i18n.pages.overviewPage.doThisNext.decided.info.url
          };
        }

        if (isUpdateTribunalDecideWithRule31(req, ftpaSetAsideFeatureEnabled) && req.session.appeal.updatedAppealDecision) {
          decision = req.session.appeal.updatedAppealDecision.toLowerCase();
          decidedDescriptionParagraphs = [
            i18n.pages.overviewPage.doThisNext.decided.decision,
            i18n.pages.overviewPage.doThisNext.decided.updatedDescriptionFtpaEnabled
          ];
        } else if (isUpdateTribunalDecideWithRule32(req, ftpaSetAsideFeatureEnabled)) {
          decidedDescriptionParagraphs = [
            i18n.pages.overviewPage.doThisNext.decided.underRule32.description,
            i18n.pages.overviewPage.doThisNext.decided.underRule32.url
          ];
          decidedInfo = {
            title: i18n.pages.overviewPage.doThisNext.decided.underRule32.info.title,
            text: i18n.pages.overviewPage.doThisNext.decided.underRule32.info.text
          };
        } else {
          decision = req.session.appeal.isDecisionAllowed;
        }

        doThisNextSection = {
          decision: decision,
          descriptionParagraphs: decidedDescriptionParagraphs,
          info: decidedInfo,
          cta: {},
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'pendingPayment':
      doThisNextSection = {
        descriptionParagraphs: [
          isLate ? i18n.pages.overviewPage.doThisNext.pendingPayment.detailsSentLate : i18n.pages.overviewPage.doThisNext.pendingPayment.detailsSent,
          i18n.pages.overviewPage.doThisNext.pendingPayment.dueDate,
          i18n.pages.overviewPage.doThisNext.pendingPayment.dueDate1
        ],
        cta: {
          link: {
            text: i18n.pages.overviewPage.doThisNext.pendingPayment.payForYourAppeal,
            url: paths.common.payLater
          }
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'ftpaSubmitted':
      doThisNextSection = {
        descriptionParagraphs: (ftpaEnabled)
          ? i18n.pages.overviewPage.doThisNext.ftpaSubmitted.description[ftpaApplicantType]
          : [`Nothing to do next`]
      };
      break;
    case 'ftpaDecided':
      if (ftpaEnabled && APPLICANT_TYPE.APPELLANT === ftpaApplicantType) {
        const ftpaDecision = req.session.appeal.ftpaAppellantDecisionOutcomeType || req.session.appeal.ftpaAppellantRjDecisionOutcomeType;
        doThisNextSection = {
          cta: {},
          ftpaDeadline: getDueDateForAppellantToRespondToFtpaDecision(req),
          descriptionParagraphs: i18n.pages.overviewPage.doThisNext.ftpaDecided.appellant[ftpaDecision]
        };
      } else if (ftpaEnabled && APPLICANT_TYPE.RESPONDENT === ftpaApplicantType) {
        const ftpaDecision = req.session.appeal.ftpaRespondentDecisionOutcomeType || req.session.appeal.ftpaRespondentRjDecisionOutcomeType;
        if (ftpaSetAsideFeatureEnabled && (ftpaDecision === 'reheardRule35' || ftpaDecision === 'remadeRule31' || ftpaDecision === 'remadeRule32')) {
          doThisNextSection = {
            cta: {},
            descriptionParagraphs: i18n.pages.overviewPage.doThisNext.ftpaDecided.respondent[ftpaDecision]
          };
        } else {
          doThisNextSection = {
            descriptionParagraphs: i18n.pages.overviewPage.doThisNext.ftpaDecided.respondent[ftpaDecision]
          };
        }
      } else {
        doThisNextSection = {
          descriptionParagraphs: [`Nothing to do next`]
        };
      }
      break;
    default:
      // default message to avoid app crashing on events that are to be implemented.
      doThisNextSection = {
        descriptionParagraphs: [
          `Nothing to do next`
        ]
      };
      break;
  }
  doThisNextSection.deadline = getDeadline(currentAppealStatus, req, dlrmFeeRemissionFlag, ftpaSetAsideFeatureEnabled);
  return doThisNextSection;
}

function isPreAddendumEvidenceUploadState(appealStatus: string): Boolean {
  // TODO: remove after Feature flag for AIP Hearing (Bundling) is permanently switched on
  if ('preHearingOutOfCountryFeatureDisabled'.startsWith(appealStatus)) {
    return true;
  }

  return [States.PRE_HEARING.id, States.DECISION.id, States.DECIDED.id].includes(appealStatus);
}

function eventByLegalRep(req: Request, eventId: string, state: string): boolean {
  return (req.session.appeal.history || []).filter(event => event.id === eventId
    && event.state
    && event.state.id === state
    && event.user
    && event.user.id !== req.idam.userDetails.uid).length > 0;
}

function getRemissionDecisionParagraphs(req: Request) {
  let doThisNextSection: DoThisNextSection;
  const remissionDecision = req.session.appeal.application.remissionDecision;
  switch (remissionDecision) {
    case 'approved':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.remissionDecided.approved.detailsSent,
          i18n.pages.overviewPage.doThisNext.remissionDecided.approved.legalOfficerCheck,
          i18n.pages.overviewPage.doThisNext.remissionDecided.approved.helpFulInfo,
          i18n.pages.overviewPage.doThisNext.remissionDecided.approved.href
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'partiallyApproved':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApproved.feeForAppeal,
          i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApproved.dueDate,
          i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApproved.howToPay,
          i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApproved.bulletText1,
          i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApproved.bulletText2,
          i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApproved.bulletText3
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      doThisNextSection.feeLeftToPay = convertToAmountOfMoneyDividedBy100(req.session.appeal.application.amountLeftToPay);
      doThisNextSection.remissionRejectedDatePlus14days = req.session.appeal.application.remissionRejectedDatePlus14days;
      break;
    case 'rejected':
      doThisNextSection = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.remissionDecided.rejected.feeForAppeal,
          i18n.pages.overviewPage.doThisNext.remissionDecided.rejected.dueDate,
          i18n.pages.overviewPage.doThisNext.remissionDecided.rejected.payForAppeal
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      doThisNextSection.feeForAppeal = getFee(req.session.appeal).calculated_amount;
      doThisNextSection.remissionRejectedDatePlus14days = req.session.appeal.application.remissionRejectedDatePlus14days;
      break;
    default:
      throw new Error(`Remission decision type ${remissionDecision} is not presented`);
  }
  return doThisNextSection;
}

function getFeeRemissionParagraph() {
  return {
    descriptionParagraphs: [
      i18n.pages.overviewPage.doThisNext.appealSubmittedDlrmFeeRemission.detailsSent,
      i18n.pages.overviewPage.doThisNext.appealSubmittedDlrmFeeRemission.feeDetails,
      i18n.pages.overviewPage.doThisNext.appealSubmittedDlrmFeeRemission.tribunalCheck,
      i18n.pages.overviewPage.doThisNext.appealSubmittedDlrmFeeRemission.dueDate
    ],
    cta: null,
    allowedAskForMoreTime: false
  };
}

function remissionDecisionEventIsTheLatest(req: Request) {
  return hasFeeRemissionDecision(req) && isEventLatestInHistoryList(req, Events.RECORD_REMISSION_DECISION.id);
}

function requestFeeRemissionEventIsTheLatest(req: Request) {
  return appealHasRemissionOption(req.session.appeal.application) && isEventLatestInHistoryList(req, Events.REQUEST_FEE_REMISSION.id);
}

function isEventLatestInHistoryList(req: Request, eventId: string) {
  return req.session.appeal.history && req.session.appeal.history.length > 0 ? req.session.appeal.history[0].id === eventId : false;
}

export {
  getAppealApplicationNextStep,
  getAppealStatus,
  getMoveAppealOfflineReason,
  getMoveAppealOfflineDate,
  isPreAddendumEvidenceUploadState,
  eventByLegalRep
};
