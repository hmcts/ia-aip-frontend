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
import { transformPerspective } from './grammarPerspectiveTransformer';
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
  const isNonLegalRep: boolean = req.session.isNonLegalRep;
  let doThisNextObject = i18n.pages.overviewPage.doThisNext;
  doThisNextObject = transformPerspective(doThisNextObject, isNonLegalRep);
  let descriptionParagraphs;
  let respondBy;
  switch (currentAppealStatus) {
    case 'appealStarted':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.appealStarted.fewQuestions,
          doThisNextObject.appealStarted.needHomeOfficeDecision
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
          doThisNextObject.appealStarted.finishQuestions,
          doThisNextObject.appealStarted.needHomeOfficeDecision
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
            doThisNextObject.appealSubmitted.detailsSent,
            doThisNextObject.appealSubmitted.dueDate
          ],
          info: {
            title: doThisNextObject.appealSubmitted.info.title,
            url: doThisNextObject.appealSubmitted.info.url
          },
          cta: null,
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'listing':
      const paragraphs = eventByLegalRep(req, Events.SUBMIT_AIP_HEARING_REQUIREMENTS.id, 'listing')
        ? [
          doThisNextObject.listing.providedByLr.direction1,
          doThisNextObject.listing.providedByLr.direction2,
          doThisNextObject.listing.dueDate
        ]
        : [
          doThisNextObject.listing.detailsSent,
          doThisNextObject.listing.dueDate
        ];
      doThisNextSection = {
        descriptionParagraphs: paragraphs,
        info: {
          title: doThisNextObject.listing.info.title,
          url: doThisNextObject.listing.info.url
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
            doThisNextObject.lateAppealSubmittedDlrmFeeRemission.detailsSent,
            doThisNextObject.lateAppealSubmittedDlrmFeeRemission.feeDetails,
            doThisNextObject.lateAppealSubmittedDlrmFeeRemission.tribunalCheck,
            doThisNextObject.lateAppealSubmittedDlrmFeeRemission.dueDate
          ],
          cta: null,
          allowedAskForMoreTime: false
        };
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextObject.lateAppealSubmitted.detailsSent,
            doThisNextObject.lateAppealSubmitted.dueDate
          ],
          info: {
            title: doThisNextObject.appealSubmitted.info.title,
            url: doThisNextObject.appealSubmitted.info.url
          },
          cta: null,
          allowedAskForMoreTime: false
        };
      }
      break;
    case 'awaitingRespondentEvidence':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.awaitingRespondentEvidence.detailsSent,
          doThisNextObject.awaitingRespondentEvidence.dueDate
        ],
        info: {
          title: doThisNextObject.awaitingRespondentEvidence.info.title,
          url: doThisNextObject.awaitingRespondentEvidence.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'lateAppealRejected':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.lateAppealRejected.description,
          doThisNextObject.lateAppealRejected.description2
        ],
        cta: {
          url: null,
          respondByText: null
        },
        allowedAskForMoreTime: false
      };
      break;
    case 'awaitingReasonsForAppeal':
      descriptionParagraphs = [doThisNextObject.awaitingReasonsForAppeal.new.description];
      respondBy = doThisNextObject.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextObject.awaitingReasonsForAppeal.new.descriptionAskForMoreTime];
        respondBy = doThisNextObject.awaitingReasonsForAppeal.new.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextObject.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextObject.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextObject.awaitingReasonsForAppeal.new.info.title,
          url: doThisNextObject.awaitingReasonsForAppeal.new.info.url
        },
        usefulDocuments: {
          title: doThisNextObject.awaitingReasonsForAppeal.new.usefulDocuments.title,
          url: doThisNextObject.awaitingReasonsForAppeal.new.usefulDocuments.url
        },
        cta: {
          url: paths.awaitingReasonsForAppeal.decision,
          respondBy
        },
        allowedAskForMoreTime: true
      };
      break;
    case 'awaitingReasonsForAppealPartial':
      descriptionParagraphs = [doThisNextObject.awaitingReasonsForAppeal.partial.description];
      respondBy = doThisNextObject.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextObject.awaitingReasonsForAppeal.partial.descriptionAskForMoreTime];
        respondBy = doThisNextObject.awaitingReasonsForAppeal.partial.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextObject.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextObject.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextObject.awaitingReasonsForAppeal.partial.info.title,
          url: doThisNextObject.awaitingReasonsForAppeal.partial.info.url
        },
        usefulDocuments: {
          title: doThisNextObject.awaitingReasonsForAppeal.partial.usefulDocuments.title,
          url: doThisNextObject.awaitingReasonsForAppeal.partial.usefulDocuments.url
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
          doThisNextObject.reasonsForAppealSubmitted.detailsSent,
          doThisNextObject.reasonsForAppealSubmitted.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'caseUnderReview':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.caseUnderReview.detailsSent,
          doThisNextObject.caseUnderReview.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'respondentReview':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.respondentReview.detailsSent,
          doThisNextObject.respondentReview.dueDate
        ],
        info: doThisNextObject.respondentReview.info
      };
      break;
    case 'decisionWithdrawn':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.decisionWithdrawn.detailsSent,
          doThisNextObject.decisionWithdrawn.dueDate
        ],
        info: doThisNextObject.decisionWithdrawn.info,
        cta: {},
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'decisionMaintained':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.decisionMaintained.description,
          doThisNextObject.decisionMaintained.description2,
          doThisNextObject.decisionMaintained.dueDate
        ],
        info: doThisNextObject.decisionMaintained.info,
        cta: {},
        hearingCentreEmail: getHearingCentreEmail(req)
      };
      break;
    case 'awaitingClarifyingQuestionsAnswersPartial':
    case 'awaitingClarifyingQuestionsAnswers':
      descriptionParagraphs = [doThisNextObject.clarifyingQuestions.description];
      respondBy = doThisNextObject.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextObject.clarifyingQuestions.descriptionAskForMoreTime];
        respondBy = doThisNextObject.clarifyingQuestions.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextObject.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextObject.stillRespondBy;
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
        doThisNextObject.awaitingCmaRequirements.description,
        doThisNextObject.awaitingCmaRequirements.description2
      ];
      respondBy = doThisNextObject.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextObject.awaitingCmaRequirements.descriptionAskForMoreTime];
        respondBy = doThisNextObject.awaitingCmaRequirements.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextObject.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextObject.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextObject.awaitingCmaRequirements.info.title,
          url: doThisNextObject.awaitingCmaRequirements.info.url
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
        doThisNextObject.submitHearingRequirements.description,
        doThisNextObject.submitHearingRequirements.description2
      ];
      respondBy = doThisNextObject.respondByText;
      if (pendingTimeExtension) {
        descriptionParagraphs = [doThisNextObject.submitHearingRequirements.descriptionAskForMoreTime];
        respondBy = doThisNextObject.submitHearingRequirements.respondByTextAskForMoreTime;
      } else if (decisionGranted) {
        respondBy = doThisNextObject.nowRespondBy;
      } else if (decisionRefused) {
        respondBy = doThisNextObject.stillRespondBy;
      }
      doThisNextSection = {
        descriptionParagraphs,
        info: {
          title: doThisNextObject.submitHearingRequirements.info.title,
          url: doThisNextObject.submitHearingRequirements.info.url
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
          doThisNextObject.clarifyingQuestionsAnswersSubmitted.description,
          doThisNextObject.clarifyingQuestionsAnswersSubmitted.dueDate
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'cmaAdjustmentsAgreed':
    case 'cmaRequirementsSubmitted':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.cmaRequirementsSubmitted.description,
          doThisNextObject.cmaRequirementsSubmitted.description2
        ],
        info: {
          title: doThisNextObject.cmaRequirementsSubmitted.info.title,
          url: doThisNextObject.cmaRequirementsSubmitted.info.url
        },
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'cmaListed':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.cmaListed.description,
          doThisNextObject.cmaListed.date,
          doThisNextObject.cmaListed.time,
          doThisNextObject.cmaListed.hearingCentre,
          doThisNextObject.cmaListed.respondByTextAskForMoreTime
        ],
        usefulDocuments: {
          title: doThisNextObject.cmaListed.usefulDoc.title,
          url: doThisNextObject.cmaListed.usefulDoc.url
        },
        info: {
          title: doThisNextObject.cmaListed.usefulDocuments.title,
          url: doThisNextObject.cmaListed.usefulDocuments.url
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
            isNonLegalRep ? doThisNextObject.nothingToDoNonLegalRep
              : doThisNextObject.nothingToDo
          ]
        };
      }
      const description = eventByLegalRep(req, Events.CREATE_CASE_SUMMARY.id, 'finalBundling')
        ? doThisNextObject.prepareForHearing.providedByLr.description
        : doThisNextObject.prepareForHearing.description;

      doThisNextSection = {
        descriptionParagraphs: [
          description,
          doThisNextObject.prepareForHearing.date,
          doThisNextObject.prepareForHearing.time,
          doThisNextObject.prepareForHearing.hearingCentre,
          doThisNextObject.prepareForHearing.hearingNotice
        ],
        info: {
          title: doThisNextObject.prepareForHearing.info.title,
          url: doThisNextObject.prepareForHearing.info.url
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
        descriptionParagraphs: doThisNextObject.decidedWithoutHearing.description
      };
      break;
    case 'ended':
      if (transferredToUpperTribunal(req)) {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextObject.transferredToUt.description,
            doThisNextObject.transferredToUt.explanation,
            doThisNextObject.transferredToUt.utAppealReferenceNumber,
            doThisNextObject.transferredToUt.utAction
          ],
          info: {
            title: doThisNextObject.transferredToUt.usefulDocuments.title,
            url: doThisNextObject.transferredToUt.usefulDocuments.url
          },
          usefulDocuments: {
            title: doThisNextObject.transferredToUt.info.title,
            url: doThisNextObject.transferredToUt.info.description
          },
          utAppealReferenceNumber: req.session.appeal.utAppealReferenceNumber
        };
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            doThisNextObject.ended.ctaInstruction,
            doThisNextObject.ended.ctaReview
          ],
          cta: {
            url: null,
            ctaTitle: doThisNextObject.ended.ctaTitle
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
          title: doThisNextObject.appealTakenOffline.info.title,
          url: doThisNextObject.appealTakenOffline.info.description
        },
        removeAppealFromOnlineReason: getMoveAppealOfflineReason(req),
        removeAppealFromOnlineDate: getMoveAppealOfflineDate(req)
      };
      break;
    case 'preHearing':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.preHearing.hearingBundle,
          doThisNextObject.preHearing.hearingBundleLink,
          doThisNextObject.preHearing.hearingDetails,
          doThisNextObject.preHearing.hearingDateTimeCentre
        ],
        info: {
          title: doThisNextObject.preHearing.info.title,
          url: doThisNextObject.preHearing.info.url
        }
      };
      break;
    case 'decided':
      let decidedDescriptionParagraphs;
      let decidedInfo;
      let decision;

      if (ftpaEnabled) {
        decidedDescriptionParagraphs = [
          doThisNextObject.decided.decision,
          doThisNextObject.decided.descriptionFtpaEnabled
        ];

        decidedInfo = {
          title: doThisNextObject.decided.info.titleFtpaEnabled,
          text: doThisNextObject.decided.info.text,
          url: doThisNextObject.decided.info.urlFtpaEnabled
        };

      } else {
        decidedDescriptionParagraphs = [
          doThisNextObject.decided.decision,
          doThisNextObject.decided.description
        ];

        decidedInfo = {
          title: doThisNextObject.decided.info.title,
          url: doThisNextObject.decided.info.url
        };
      }

      if (isUpdateTribunalDecideWithRule31(req, ftpaSetAsideFeatureEnabled) && req.session.appeal.updatedAppealDecision) {
        decision = req.session.appeal.updatedAppealDecision.toLowerCase();
        decidedDescriptionParagraphs = [
          doThisNextObject.decided.decision,
          doThisNextObject.decided.updatedDescriptionFtpaEnabled
        ];
      } else if (isUpdateTribunalDecideWithRule32(req, ftpaSetAsideFeatureEnabled)) {
        decidedDescriptionParagraphs = [
          doThisNextObject.decided.underRule32.description,
          doThisNextObject.decided.underRule32.url
        ];
        decidedInfo = {
          title: doThisNextObject.decided.underRule32.info.title,
          text: doThisNextObject.decided.underRule32.info.text
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
            doThisNextObject.appealSubmittedDlrmFeeRemission.detailsSent,
            doThisNextObject.appealSubmittedDlrmFeeRemission.feeDetails,
            doThisNextObject.appealSubmittedDlrmFeeRemission.tribunalCheck,
            doThisNextObject.appealSubmittedDlrmFeeRemission.dueDate
          ],
          cta: null,
          allowedAskForMoreTime: false
        };
      } else {
        doThisNextSection = {
          descriptionParagraphs: [
            isLate ? doThisNextObject.pendingPayment.detailsSentLate : doThisNextObject.pendingPayment.detailsSent,
            doThisNextObject.pendingPayment.dueDate,
            doThisNextObject.pendingPayment.dueDate1
          ],
          cta: {
            link: {
              text: doThisNextObject.pendingPayment.payForYourAppeal,
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
          ? doThisNextObject.ftpaSubmitted.description[ftpaApplicantType]
          : ['Nothing to do next']
      };
      break;
    case 'ftpaDecided':
      if (ftpaEnabled && APPLICANT_TYPE.APPELLANT === ftpaApplicantType) {
        const ftpaDecision = req.session.appeal.ftpaAppellantDecisionOutcomeType || req.session.appeal.ftpaAppellantRjDecisionOutcomeType;
        doThisNextSection = {
          cta: {},
          ftpaDeadline: getDueDateForAppellantToRespondToFtpaDecision(req),
          descriptionParagraphs: doThisNextObject.ftpaDecided.appellant[ftpaDecision]
        };
      } else if (ftpaEnabled && APPLICANT_TYPE.RESPONDENT === ftpaApplicantType) {
        const ftpaDecision = req.session.appeal.ftpaRespondentDecisionOutcomeType || req.session.appeal.ftpaRespondentRjDecisionOutcomeType;
        if (ftpaSetAsideFeatureEnabled && (ftpaDecision === 'reheardRule35' || ftpaDecision === 'remadeRule31' || ftpaDecision === 'remadeRule32')) {
          doThisNextSection = {
            cta: {},
            descriptionParagraphs: doThisNextObject.ftpaDecided.respondent[ftpaDecision]
          };
        } else {
          doThisNextSection = {
            descriptionParagraphs: doThisNextObject.ftpaDecided.respondent[ftpaDecision]
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
        descriptionParagraphs: [doThisNextObject.remitted.decision],
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
  const isNonLegalRep: boolean = req.session.isNonLegalRep;
  let doThisNextObject = i18n.pages.overviewPage.doThisNext;
  doThisNextObject = transformPerspective(doThisNextObject, isNonLegalRep);
  switch (remissionDecision) {
    case 'approved':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.remissionDecided.approved.detailsSent,
          doThisNextObject.remissionDecided.approved.legalOfficerCheck,
          doThisNextObject.remissionDecided.approved.helpFulInfo,
          doThisNextObject.remissionDecided.approved.href
        ],
        cta: null,
        allowedAskForMoreTime: false
      };
      break;
    case 'partiallyApproved':
      doThisNextSection = {
        descriptionParagraphs: [
          doThisNextObject.remissionDecided.partiallyApproved.feeForAppeal,
          doThisNextObject.remissionDecided.partiallyApproved.dueDate,
          doThisNextObject.remissionDecided.partiallyApproved.howToPay,
          doThisNextObject.remissionDecided.partiallyApproved.bulletText
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
          doThisNextObject.remissionDecided.rejected.feeForAppeal,
          doThisNextObject.remissionDecided.rejected.dueDate,
          doThisNextObject.remissionDecided.rejected.payForAppeal
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
  let doThisNextObject = i18n.pages.overviewPage.doThisNext;
  doThisNextObject = transformPerspective(doThisNextObject, isNonLegalRep);
  const doThisNextSection: DoThisNextSection = {
    descriptionParagraphs: [
      doThisNextObject.appealSubmittedDlrmFeeRemission.detailsSent,
      doThisNextObject.appealSubmittedDlrmFeeRemission.feeDetails,
      doThisNextObject.appealSubmittedDlrmFeeRemission.tribunalCheck,
      doThisNextObject.appealSubmittedDlrmFeeRemission.dueDate
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
