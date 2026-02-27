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
  utAppealReferenceNumber?: string;
  sourceOfRemittal?: string;
  ccdReferenceNumber?: string;
}

/**
 * Returns the appeal status, overrides status if the appeal is late .
 * @param req the request containing the session and appeal status
 */
function getAppealStatus(req: Request) {
  const appeal = req.session.appeal;
  if (appeal.appealStatus === States.FINAL_BUNDLING.id
    && appeal.history.find(event => event.id === Events.DECISION_WITHOUT_HEARING.id)) {
    return 'decidedWithoutHearing';
  } else if (appeal.application.isAppealLate && appeal.appealStatus !== States.ENDED.id) {
    if (appeal.outOfTimeDecisionType === 'rejected') {
      return 'lateAppealRejected';
    }
    if (appeal.appealStatus === 'appealSubmitted') {
      return 'lateAppealSubmitted';
    }
    return appeal.appealStatus;
  } else if (appeal.appealStatus === States.APPEAL_STARTED.id) {
    return _.has(appeal, 'application.homeOfficeRefNumber') ? `${appeal.appealStatus}Partial` : appeal.appealStatus;
  } else if (appeal.appealStatus === States.AWAITING_REASONS_FOR_APPEAL.id) {
    return _.has(appeal, 'reasonsForAppeal.applicationReason') ? `${appeal.appealStatus}Partial` : appeal.appealStatus;
  } else if (appeal.appealStatus === States.RESPONDENT_REVIEW.id) {
    if (appeal.history.find(event => event.id === Events.REQUEST_RESPONSE_REVIEW.id)) {
      return appeal.appealReviewOutcome;
    }
    return appeal.appealStatus;
  } else {
    return appeal.appealStatus;
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
  const deadLineDate = getDeadline(currentAppealStatus, req, dlrmFeeRemissionFlag, ftpaSetAsideFeatureEnabled);
  const isLateRemissionRequest = req.session.appeal.application.isLateRemissionRequest;
  const isNonLegalRep = req.session.isNonLegalRep;
  const doThisNextSectionValues = i18n.pages.overviewPage[isNonLegalRep ? 'doThisNextNonLegalRep' : 'doThisNext'];
  let descriptionParagraphs;
  let respondBy;
  switch (currentAppealStatus) {
    case 'appealStarted':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.appealStarted.fewQuestions,
          doThisNextSectionValues.appealStarted.needHomeOfficeDecision
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
          doThisNextSectionValues.appealStarted.finishQuestions,
          doThisNextSectionValues.appealStarted.needHomeOfficeDecision
        ],
        info: null,
        cta: {
          url: paths.appealStarted.taskList
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'appealSubmitted':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req) && !isLateRemissionRequest) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = getFeeRemissionParagraph(deadLineDate, isNonLegalRep);
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextSectionValues.appealSubmitted.detailsSent,
            doThisNextSectionValues.appealSubmitted.dueDate
          ],
          info: {
            title: doThisNextSectionValues.appealSubmitted.info.title,
            url: doThisNextSectionValues.appealSubmitted.info.url
          },
          cta: null,
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'listing':
      const paragraphs = eventByLegalRep(req, Events.SUBMIT_AIP_HEARING_REQUIREMENTS.id, 'listing')
        ? [
          doThisNextSectionValues.listing.providedByLr.direction1,
          doThisNextSectionValues.listing.providedByLr.direction2,
          doThisNextSectionValues.listing.dueDate
        ]
        : [
          doThisNextSectionValues.listing.detailsSent,
          doThisNextSectionValues.listing.dueDate
        ];
      doThisNextSection = {
        descriptionParagraphs: paragraphs,
        info: {
          title: doThisNextSectionValues.listing.info.title,
          url: doThisNextSectionValues.listing.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'lateAppealSubmitted':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req) && !isLateRemissionRequest) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag &&
        requestFeeRemissionEventIsTheLatest(req)) {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextSectionValues.lateAppealSubmittedDlrmFeeRemission.detailsSent,
            doThisNextSectionValues.lateAppealSubmittedDlrmFeeRemission.feeDetails,
            doThisNextSectionValues.lateAppealSubmittedDlrmFeeRemission.tribunalCheck,
            doThisNextSectionValues.lateAppealSubmittedDlrmFeeRemission.dueDate
          ],
          cta: null,
          allowedAskForMoreTime: false
        };
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextSectionValues.lateAppealSubmitted.detailsSent,
            doThisNextSectionValues.lateAppealSubmitted.dueDate
          ],
          info: {
            title: doThisNextSectionValues.appealSubmitted.info.title,
            url: doThisNextSectionValues.appealSubmitted.info.url
          },
          cta: null,
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'awaitingRespondentEvidence':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.awaitingRespondentEvidence.detailsSent,
          doThisNextSectionValues.awaitingRespondentEvidence.dueDate
        ],
        info: {
          title: doThisNextSectionValues.awaitingRespondentEvidence.info.title,
          url: doThisNextSectionValues.awaitingRespondentEvidence.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'lateAppealRejected':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.lateAppealRejected.description,
          doThisNextSectionValues.lateAppealRejected.description2
        ],
        cta: {
          url: null,
          respondByText: null
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'awaitingReasonsForAppeal':
      descriptionParagraphs = [doThisNextSectionValues.awaitingReasonsForAppeal.new.description];
      respondBy = doThisNextSectionValues.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextSectionValues.awaitingReasonsForAppeal.new.descriptionAskForMoreTime];
        respondBy = doThisNextSectionValues.awaitingReasonsForAppeal.new.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextSectionValues.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextSectionValues.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextSectionValues.awaitingReasonsForAppeal.new.info.title,
          url: doThisNextSectionValues.awaitingReasonsForAppeal.new.info.url
        },
        usefulDocuments: {
          title: doThisNextSectionValues.awaitingReasonsForAppeal.new.usefulDocuments.title,
          url: doThisNextSectionValues.awaitingReasonsForAppeal.new.usefulDocuments.url
        },
        cta: {
          url: paths.awaitingReasonsForAppeal.decision,
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'awaitingReasonsForAppealPartial':
      descriptionParagraphs = [doThisNextSectionValues.awaitingReasonsForAppeal.partial.description];
      respondBy = doThisNextSectionValues.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextSectionValues.awaitingReasonsForAppeal.partial.descriptionAskForMoreTime];
        respondBy = doThisNextSectionValues.awaitingReasonsForAppeal.partial.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextSectionValues.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextSectionValues.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextSectionValues.awaitingReasonsForAppeal.partial.info.title,
          url: doThisNextSectionValues.awaitingReasonsForAppeal.partial.info.url
        },
        usefulDocuments: {
          title: doThisNextSectionValues.awaitingReasonsForAppeal.partial.usefulDocuments.title,
          url: doThisNextSectionValues.awaitingReasonsForAppeal.partial.usefulDocuments.url
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
          doThisNextSectionValues.reasonsForAppealSubmitted.detailsSent,
          doThisNextSectionValues.reasonsForAppealSubmitted.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'caseUnderReview':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.caseUnderReview.detailsSent,
          doThisNextSectionValues.caseUnderReview.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'respondentReview':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.respondentReview.detailsSent,
          doThisNextSectionValues.respondentReview.dueDate
        ],
        info: doThisNextSectionValues.respondentReview.info
      };
      break;
    case 'decisionWithdrawn':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.decisionWithdrawn.detailsSent,
          doThisNextSectionValues.decisionWithdrawn.dueDate
        ],
        info: doThisNextSectionValues.decisionWithdrawn.info,
        cta: {},
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'decisionMaintained':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.decisionMaintained.description,
          doThisNextSectionValues.decisionMaintained.description2,
          doThisNextSectionValues.decisionMaintained.dueDate
        ],
        info: doThisNextSectionValues.decisionMaintained.info,
        cta: {},
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'awaitingClarifyingQuestionsAnswersPartial':
    case 'awaitingClarifyingQuestionsAnswers':
      descriptionParagraphs = [doThisNextSectionValues.clarifyingQuestions.description];
      respondBy = doThisNextSectionValues.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextSectionValues.clarifyingQuestions.descriptionAskForMoreTime];
        respondBy = doThisNextSectionValues.clarifyingQuestions.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextSectionValues.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextSectionValues.stillRespondBy;
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
        doThisNextSectionValues.awaitingCmaRequirements.description,
        doThisNextSectionValues.awaitingCmaRequirements.description2
      ];
      respondBy = doThisNextSectionValues.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextSectionValues.awaitingCmaRequirements.descriptionAskForMoreTime];
        respondBy = doThisNextSectionValues.awaitingCmaRequirements.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextSectionValues.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextSectionValues.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextSectionValues.awaitingCmaRequirements.info.title,
          url: doThisNextSectionValues.awaitingCmaRequirements.info.url
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
        doThisNextSectionValues.submitHearingRequirements.description,
        doThisNextSectionValues.submitHearingRequirements.description2
      ];
      respondBy = doThisNextSectionValues.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextSectionValues.submitHearingRequirements.descriptionAskForMoreTime];
        respondBy = doThisNextSectionValues.submitHearingRequirements.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextSectionValues.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextSectionValues.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextSectionValues.submitHearingRequirements.info.title,
          url: doThisNextSectionValues.submitHearingRequirements.info.url
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
          doThisNextSectionValues.clarifyingQuestionsAnswersSubmitted.description,
          doThisNextSectionValues.clarifyingQuestionsAnswersSubmitted.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'cmaAdjustmentsAgreed':
    case 'cmaRequirementsSubmitted':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.cmaRequirementsSubmitted.description,
          doThisNextSectionValues.cmaRequirementsSubmitted.description2
        ],
        info: {
          title: doThisNextSectionValues.cmaRequirementsSubmitted.info.title,
          url: doThisNextSectionValues.cmaRequirementsSubmitted.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'cmaListed':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.cmaListed.description,
          doThisNextSectionValues.cmaListed.date,
          doThisNextSectionValues.cmaListed.time,
          doThisNextSectionValues.cmaListed.hearingCentre,
          doThisNextSectionValues.cmaListed.respondByTextAskForMoreTime
        ],
        usefulDocuments: {
          title: doThisNextSectionValues.cmaListed.usefulDoc.title,
          url: doThisNextSectionValues.cmaListed.usefulDoc.url
        },
        info: {
          title: doThisNextSectionValues.cmaListed.usefulDocuments.title,
          url: doThisNextSectionValues.cmaListed.usefulDocuments.url
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
      const hearingBundleFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.HEARING_BUNDLE, false);
      if (!hearingBundleFeatureEnabled) {
        return {
          descriptionParagraphs: [
            doThisNextSectionValues.nothingToDo
          ]
        };
      }
      const description = eventByLegalRep(req, Events.CREATE_CASE_SUMMARY.id, 'finalBundling')
        ? doThisNextSectionValues.prepareForHearing.providedByLr.description
        : doThisNextSectionValues.prepareForHearing.description;

      doThisNextSection = {
        descriptionParagraphs: [
          description,
          doThisNextSectionValues.prepareForHearing.date,
          doThisNextSectionValues.prepareForHearing.time,
          doThisNextSectionValues.prepareForHearing.hearingCentre,
          doThisNextSectionValues.prepareForHearing.hearingNotice
        ],
        info: {
          title: doThisNextSectionValues.prepareForHearing.info.title,
          url: doThisNextSectionValues.prepareForHearing.info.url
        },
        cta: {},
        allowedAskForMoreTime: false,
        date: getHearingDate(req),
        time: getHearingTime(req),
        hearingCentre: getHearingCentre(req)
      };
      break;
    case 'decidedWithoutHearing':
      doThisNextSection = {
        descriptionParagraphs: doThisNextSectionValues.decidedWithoutHearing.description
      };
      break;
    case 'ended':
      if (transferredToUpperTribunal(req)) {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextSectionValues.transferredToUt.description,
            doThisNextSectionValues.transferredToUt.explanation,
            doThisNextSectionValues.transferredToUt.utAppealReferenceNumber,
            doThisNextSectionValues.transferredToUt.utAction
          ],
          info: {
            title: doThisNextSectionValues.transferredToUt.usefulDocuments.title,
            url: doThisNextSectionValues.transferredToUt.usefulDocuments.url
          },
          usefulDocuments: {
            title: doThisNextSectionValues.transferredToUt.info.title,
            url: doThisNextSectionValues.transferredToUt.info.description
          },
          utAppealReferenceNumber: req.session.appeal.utAppealReferenceNumber
        };
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextSectionValues.ended.ctaInstruction,
            doThisNextSectionValues.ended.ctaReview
          ],
          cta: {
            url: null,
            ctaTitle: doThisNextSectionValues.ended.ctaTitle
          },
          allowedAskForMoreTime: false,
          hearingCentreEmail: getHearingCentreEmail(req)
        };
      }
      break;
    case 'appealTakenOffline':
      doThisNextSection = {
        descriptionParagraphs: [],
        info: {
          title: doThisNextSectionValues.appealTakenOffline.info.title,
          url: doThisNextSectionValues.appealTakenOffline.info.description
        },
        removeAppealFromOnlineReason: getMoveAppealOfflineReason(req),
        removeAppealFromOnlineDate: getMoveAppealOfflineDate(req)
      };
      break;
    case 'preHearing':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.preHearing.hearingBundle,
          doThisNextSectionValues.preHearing.hearingBundleLink,
          doThisNextSectionValues.preHearing.hearingDetails,
          doThisNextSectionValues.preHearing.hearingDateTimeCentre
        ],
        info: {
          title: doThisNextSectionValues.preHearing.info.title,
          url: doThisNextSectionValues.preHearing.info.url
        }
      };
      break;
    case 'decided':
      let decidedDescriptionParagraphs;
      let decidedInfo;
      let decision;

      if (ftpaEnabled) {
        decidedDescriptionParagraphs = [
          doThisNextSectionValues.decided.decision,
          doThisNextSectionValues.decided.descriptionFtpaEnabled
        ];

        decidedInfo = {
          title: doThisNextSectionValues.decided.info.titleFtpaEnabled,
          text: doThisNextSectionValues.decided.info.text,
          url: doThisNextSectionValues.decided.info.urlFtpaEnabled
        };

      } else {
        decidedDescriptionParagraphs = [
          doThisNextSectionValues.decided.decision,
          doThisNextSectionValues.decided.description
        ];

        decidedInfo = {
          title: doThisNextSectionValues.decided.info.title,
          url: doThisNextSectionValues.decided.info.url
        };
      }

      if (isUpdateTribunalDecideWithRule31(req, ftpaSetAsideFeatureEnabled) && req.session.appeal.updatedAppealDecision) {
        decision = req.session.appeal.updatedAppealDecision.toLowerCase();
        decidedDescriptionParagraphs = [
          doThisNextSectionValues.decided.decision,
          doThisNextSectionValues.decided.updatedDescriptionFtpaEnabled
        ];
      } else if (isUpdateTribunalDecideWithRule32(req, ftpaSetAsideFeatureEnabled)) {
        decidedDescriptionParagraphs = [
          doThisNextSectionValues.decided.underRule32.description,
          doThisNextSectionValues.decided.underRule32.url
        ];
        decidedInfo = {
          title: doThisNextSectionValues.decided.underRule32.info.title,
          text: doThisNextSectionValues.decided.underRule32.info.text
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
      break;
    case 'pendingPayment':
      if (dlrmFeeRemissionFlag && remissionDecisionEventIsTheLatest(req)) {
        doThisNextSection = getRemissionDecisionParagraphs(req);
      } else if (dlrmFeeRemissionFlag && appealHasRemissionOption(req.session.appeal.application)) {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextSectionValues.appealSubmittedDlrmFeeRemission.detailsSent,
            doThisNextSectionValues.appealSubmittedDlrmFeeRemission.feeDetails,
            doThisNextSectionValues.appealSubmittedDlrmFeeRemission.tribunalCheck,
            doThisNextSectionValues.appealSubmittedDlrmFeeRemission.dueDate
          ],
          cta: null,
          allowedAskForMoreTime: false
        };
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            isLate ? doThisNextSectionValues.pendingPayment.detailsSentLate : doThisNextSectionValues.pendingPayment.detailsSent,
            doThisNextSectionValues.pendingPayment.dueDate,
            doThisNextSectionValues.pendingPayment.dueDate1
          ],
          cta: {
            link: {
              text: doThisNextSectionValues.pendingPayment.payForYourAppeal,
              url: paths.common.payLater
            }
          },
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'ftpaSubmitted':
      doThisNextSection = {
        descriptionParagraphs: (ftpaEnabled)
          ? doThisNextSectionValues.ftpaSubmitted.description[ftpaApplicantType]
          : ['Nothing to do next']
      };
      break;
    case 'ftpaDecided':
      if (ftpaEnabled && APPLICANT_TYPE.APPELLANT === ftpaApplicantType) {
        const ftpaDecision = req.session.appeal.ftpaAppellantDecisionOutcomeType || req.session.appeal.ftpaAppellantRjDecisionOutcomeType;
        doThisNextSection = {
          cta: {},
          ftpaDeadline: getDueDateForAppellantToRespondToFtpaDecision(req),
          descriptionParagraphs: doThisNextSectionValues.ftpaDecided.appellant[ftpaDecision]
        };
      } else if (ftpaEnabled && APPLICANT_TYPE.RESPONDENT === ftpaApplicantType) {
        const ftpaDecision = req.session.appeal.ftpaRespondentDecisionOutcomeType || req.session.appeal.ftpaRespondentRjDecisionOutcomeType;
        if (ftpaSetAsideFeatureEnabled && (ftpaDecision === 'reheardRule35' || ftpaDecision === 'remadeRule31' || ftpaDecision === 'remadeRule32')) {
          doThisNextSection = {
            cta: {},
            descriptionParagraphs: doThisNextSectionValues.ftpaDecided.respondent[ftpaDecision]
          };
        } else {
          doThisNextSection = {
            descriptionParagraphs: doThisNextSectionValues.ftpaDecided.respondent[ftpaDecision]
          };
        }
      } else {
        doThisNextSection = {
          descriptionParagraphs: ['Nothing to do next']
        };
      }
      break;
    case 'remitted':
      doThisNextSection = {
        cta: {},
        descriptionParagraphs: [doThisNextSectionValues.remitted.decision],
        sourceOfRemittal: req.session.appeal.sourceOfRemittal
      };
      break;
    default:
      // default message to avoid app crashing on events that are to be implemented.
      doThisNextSection = {
        descriptionParagraphs: [
          'Nothing to do next'
        ]
      };
      break;
  }
  doThisNextSection.deadline = deadLineDate;
  return doThisNextSection;
}

function isAddendumEvidenceUploadState(appealStatus: string): Boolean {
  // TODO: remove after Feature flag for AIP Hearing (Bundling) is permanently switched on
  if ('preHearingOutOfCountryFeatureDisabled'.startsWith(appealStatus)) {
    return true;
  }

  return [States.PRE_HEARING.id, States.DECISION.id, States.DECIDED.id,
    States.FTPA_SUBMITTED.id, States.FTPA_DECIDED.id].includes(appealStatus);
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
  const isNonLegalRep = req.session.isNonLegalRep;
  const doThisNextSectionValues = i18n.pages.overviewPage[isNonLegalRep ? 'doThisNextNonLegalRep' : 'doThisNext'];
  switch (remissionDecision) {
    case 'approved':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.remissionDecided.approved.detailsSent,
          doThisNextSectionValues.remissionDecided.approved.legalOfficerCheck,
          doThisNextSectionValues.remissionDecided.approved.helpFulInfo,
          doThisNextSectionValues.remissionDecided.approved.href
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'partiallyApproved':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.remissionDecided.partiallyApproved.feeForAppeal,
          doThisNextSectionValues.remissionDecided.partiallyApproved.dueDate,
          doThisNextSectionValues.remissionDecided.partiallyApproved.howToPay,
          doThisNextSectionValues.remissionDecided.partiallyApproved.bulletText
        ],
        cta: {},
        allowedAskForMoreTime: false
      };
      doThisNextSection.feeLeftToPay = convertToAmountOfMoneyDividedBy100(req.session.appeal.application.amountLeftToPay);
      doThisNextSection.remissionRejectedDatePlus14days = req.session.appeal.application.remissionRejectedDatePlus14days;
      doThisNextSection.ccdReferenceNumber = req.session.appeal.ccdReferenceNumber.split(' ').join('-');
      break;
    case 'rejected':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextSectionValues.remissionDecided.rejected.feeForAppeal,
          doThisNextSectionValues.remissionDecided.rejected.dueDate,
          doThisNextSectionValues.remissionDecided.rejected.payForAppeal
        ],
        cta: {},
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

function getFeeRemissionParagraph(deadLineDate: string, isNonLegalRep: boolean) {
  const doThisNextSectionValues = i18n.pages.overviewPage[isNonLegalRep ? 'doThisNextNonLegalRep' : 'doThisNext'];
  const doThisNextSection: DoThisNextSection = {
    descriptionParagraphs: [
      doThisNextSectionValues.appealSubmittedDlrmFeeRemission.detailsSent,
      doThisNextSectionValues.appealSubmittedDlrmFeeRemission.feeDetails,
      doThisNextSectionValues.appealSubmittedDlrmFeeRemission.tribunalCheck,
      doThisNextSectionValues.appealSubmittedDlrmFeeRemission.dueDate
    ],
    cta: null,
    allowedAskForMoreTime: false
  };
  doThisNextSection.deadline = deadLineDate;
  return doThisNextSection;
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

function transferredToUpperTribunal(req: Request): boolean {
  return req.session.appeal.utAppealReferenceNumber == null ? false : true;
}

export {
  getAppealApplicationNextStep,
  getAppealStatus,
  getMoveAppealOfflineReason,
  getMoveAppealOfflineDate,
  isAddendumEvidenceUploadState,
  eventByLegalRep,
  transferredToUpperTribunal,
  isEventLatestInHistoryList,
  requestFeeRemissionEventIsTheLatest,
  remissionDecisionEventIsTheLatest,
  getFeeRemissionParagraph,
  getRemissionDecisionParagraphs

};
