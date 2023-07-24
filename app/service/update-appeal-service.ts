import { Request } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { FEATURE_FLAGS } from '../data/constants';
import { formatDate } from '../utils/date-utils';
import { boolToYesNo, toIsoDate, yesNoToBool } from '../utils/utils';
import { AuthenticationService, SecurityHeaders } from './authentication-service';
import { CcdService } from './ccd-service';
import { addToDocumentMapper, documentIdToDocStoreUrl } from './document-management-service';
import LaunchDarklyService from './launchDarkly-service';
import S2SService from './s2s-service';

enum Subscriber {
  APPELLANT = 'appellant',
  SUPPORTER = 'supporter'
}

enum YesOrNo {
  YES = 'Yes',
  NO = 'No'
}

function isEmpty(text: string) {
  return text === '';
}

export default class UpdateAppealService {
  private readonly _ccdService: CcdService;
  private readonly _authenticationService: AuthenticationService;
  private readonly _s2sService: S2SService;

  constructor(ccdService: CcdService, authenticationService: AuthenticationService, s2sService: S2SService = null) {
    this._ccdService = ccdService;
    this._authenticationService = authenticationService;
    this._s2sService = s2sService;
  }

  getCcdService(): CcdService {
    return this._ccdService;
  }

  getAuthenticationService(): AuthenticationService {
    return this._authenticationService;
  }

  async loadAppeal(req: Request) {
    const securityHeaders: SecurityHeaders = await this._authenticationService.getSecurityHeaders(req);
    const ccdCase: CcdCaseDetails = await this._ccdService.loadOrCreateCase(req.idam.userDetails.uid, securityHeaders);
    req.session.ccdCaseId = ccdCase.id;
    req.session.appeal = this.mapCcdCaseToAppeal(ccdCase);
  }

  private getDate(ccdDate): AppealDate {
    if (ccdDate) {
      let dateLetterSent;
      const decisionDate = new Date(ccdDate);
      dateLetterSent = {
        year: decisionDate.getFullYear().toString(),
        month: (decisionDate.getMonth() + 1).toString(),
        day: decisionDate.getDate().toString()
      };
      return dateLetterSent;
    }
    return null;
  }

  async submitSimpleEvent(event, caseId: string, data, userId: string, userToken: string): Promise<Appeal> {
    const securityHeaders: SecurityHeaders = {
      userToken: userToken,
      serviceToken: await this._s2sService.getServiceToken()
    };
    const updateEventResponse = await this._ccdService.startUpdateAppeal(userId, caseId, event.id, securityHeaders);
    const ccdCase: CcdCaseDetails = await this._ccdService.submitUpdateAppeal(userId, caseId, securityHeaders, {
      event: {
        id: updateEventResponse.event_id,
        summary: event.summary,
        description: event.description
      },
      data: data,
      event_token: updateEventResponse.token,
      ignore_warning: true,
      supplementary_data_request: null
    });
    return this.mapCcdCaseToAppeal(ccdCase);
  }

  // TODO: remove submitEvent when all app is refactored using new submitEvent
  async submitEvent(event, req: Request): Promise<CcdCaseDetails> {
    const securityHeaders: SecurityHeaders = await this._authenticationService.getSecurityHeaders(req);
    const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
    const currentUserId = req.idam.userDetails.uid;
    const caseData = this.convertToCcdCaseData(req.session.appeal, paymentsFlag);

    const updatedCcdCase = {
      id: req.session.ccdCaseId,
      state: req.session.appeal.appealStatus,
      case_data: caseData
    };

    const updatedAppeal = await this._ccdService.updateAppeal(event, currentUserId, updatedCcdCase, securityHeaders);
    return updatedAppeal;
  }

  async submitEventRefactored(event, appeal: Appeal, uid: string, userToken: string, paymentsFlag = false): Promise<Appeal> {
    const securityHeaders: SecurityHeaders = {
      userToken: `Bearer ${userToken}`,
      serviceToken: await this._s2sService.getServiceToken()
    };
    const caseData: CaseData = this.convertToCcdCaseData(appeal, paymentsFlag);
    const updatedCcdCase: CcdCaseDetails = {
      id: appeal.ccdCaseId,
      state: appeal.appealStatus,
      case_data: caseData
    };
    const ccdCase: CcdCaseDetails = await this._ccdService.updateAppeal(event, uid, updatedCcdCase, securityHeaders);
    return this.mapCcdCaseToAppeal(ccdCase);
  }

  mapCcdCaseToAppeal(ccdCase: CcdCaseDetails): Appeal {
    const caseData: CaseData = ccdCase.case_data;
    const dateLetterSent = this.getDate(caseData.homeOfficeDecisionDate);
    const decisionLetterReceivedDate = this.getDate(caseData.decisionLetterReceivedDate);
    const dateOfBirth = this.getDate(caseData.appellantDateOfBirth);
    const listHearingCentre = caseData.listCaseHearingCentre || '';
    const listHearingLength = caseData.listCaseHearingLength || '';
    const listHearingDate = caseData.listCaseHearingDate || '';
    const dateClientLeaveUk = this.getDate(caseData.dateClientLeaveUk);

    const appellantAddress = caseData.appellantAddress ? {
      line1: caseData.appellantAddress.AddressLine1,
      line2: caseData.appellantAddress.AddressLine2,
      city: caseData.appellantAddress.PostTown,
      county: caseData.appellantAddress.County,
      postcode: caseData.appellantAddress.PostCode
    } : null;

    const sponsorAddress = caseData.sponsorAddress ? {
      line1: caseData.sponsorAddress.AddressLine1,
      line2: caseData.sponsorAddress.AddressLine2,
      city: caseData.sponsorAddress.PostTown,
      county: caseData.sponsorAddress.County,
      postcode: caseData.sponsorAddress.PostCode
    } : null;

    const subscriptions = caseData.subscriptions || [];
    const sponsorSubscriptions = caseData.sponsorSubscriptions || [];
    let outOfTimeAppeal: LateAppeal = null;
    // let respondentDocuments: RespondentDocument[] = null;
    let directions: Direction[] = null;
    let reasonsForAppealDocumentUploads: Evidence[] = null;
    let requestClarifyingQuestionsDirection: Collection<CcdDirection>;
    let cmaRequirements: CmaRequirements = {};
    let hearingRequirements: HearingRequirements = {};
    let draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[];
    let hasPendingTimeExtension = false;
    let documentMap: DocumentMap[] = [];

    const appellantContactDetails = subscriptions.reduce((contactDetails, subscription) => {
      const value = subscription.value;
      if (Subscriber.APPELLANT === value.subscriber) {
        return {
          email: value.email || null,
          wantsEmail: (YesOrNo.YES === value.wantsEmail),
          phone: value.mobileNumber || null,
          wantsSms: (YesOrNo.YES === value.wantsSms)
        };
      }
    }, {}) || { email: null, wantsEmail: false, phone: null, wantsSms: false };

    const sponsorContactDetails = sponsorSubscriptions.reduce((scd, sponsorSubscription) => {
      const value = sponsorSubscription.value;
      return {
        email: value.email || null,
        wantsEmail: (YesOrNo.YES === value.wantsEmail),
        phone: value.mobileNumber || null,
        wantsSms: (YesOrNo.YES === value.wantsSms)
      };
    }, {}) || { sponsorEmail: null, sponsorWantsEmail: false, phone: null, wantsSms: false };

    if (yesNoToBool(caseData.submissionOutOfTime)) {
      if (caseData.applicationOutOfTimeExplanation) {
        outOfTimeAppeal = { reason: caseData.applicationOutOfTimeExplanation };
      }
      if (caseData.applicationOutOfTimeDocument && caseData.applicationOutOfTimeDocument.document_filename) {

        const documentMapperId: string = addToDocumentMapper(caseData.applicationOutOfTimeDocument.document_url, documentMap);
        outOfTimeAppeal = {
          ...outOfTimeAppeal,
          evidence: {
            fileId: documentMapperId,
            name: caseData.applicationOutOfTimeDocument.document_filename
          }
        };
      }
    }

    if (caseData.reasonsForAppealDocuments) {
      reasonsForAppealDocumentUploads = [];
      caseData.reasonsForAppealDocuments.forEach(document => {
        const documentMapperId: string = addToDocumentMapper(document.value.document.document_url, documentMap);

        reasonsForAppealDocumentUploads.push(
          {
            fileId: documentMapperId,
            name: document.value.document.document_filename,
            dateUploaded: document.value.dateUploaded,
            description: document.value.description
          }
        );
      });
    }

    if (caseData.directions) {
      directions = caseData.directions.map((ccdDirection: Collection<CcdDirection>): Direction => {
        const direction: Direction = {
          id: ccdDirection.id,
          ...ccdDirection.value
        };
        return direction;
      });
      requestClarifyingQuestionsDirection = caseData.directions.find(direction => direction.value.tag === 'requestClarifyingQuestions');
    }

    if (caseData.draftClarifyingQuestionsAnswers && caseData.draftClarifyingQuestionsAnswers.length > 0) {
      draftClarifyingQuestionsAnswers = this.mapCcdClarifyingQuestionsToAppeal(caseData.draftClarifyingQuestionsAnswers, documentMap);
    } else if (requestClarifyingQuestionsDirection && ccdCase.state === 'awaitingClarifyingQuestionsAnswers') {
      draftClarifyingQuestionsAnswers = [...requestClarifyingQuestionsDirection.value.clarifyingQuestions].map((question) => {
        question.value.dateSent = requestClarifyingQuestionsDirection.value.dateSent;
        question.value.dueDate = requestClarifyingQuestionsDirection.value.dateDue;
        question.value.directionId = requestClarifyingQuestionsDirection.value.uniqueId;
        return question;
      });
      draftClarifyingQuestionsAnswers.push({
        value: {
          dateSent: requestClarifyingQuestionsDirection.value.dateSent,
          dueDate: requestClarifyingQuestionsDirection.value.dateDue,
          question: i18n.pages.clarifyingQuestionAnythingElseQuestion.question,
          directionId: requestClarifyingQuestionsDirection.value.uniqueId
        }
      });
    }

    if (caseData.isInterpreterServicesNeeded) {
      let isInterpreterServicesNeeded: boolean = yesNoToBool(caseData.isInterpreterServicesNeeded);
      let interpreterLanguage = {};
      let isHearingRoomNeeded: boolean = null;
      let isHearingLoopNeeded: boolean = null;
      if (caseData.isHearingRoomNeeded) {
        isHearingRoomNeeded = yesNoToBool(caseData.isHearingRoomNeeded);
      }
      if (caseData.isHearingLoopNeeded) {
        isHearingLoopNeeded = yesNoToBool(caseData.isHearingLoopNeeded);
      }
      if (caseData.interpreterLanguage) {
        interpreterLanguage = caseData.interpreterLanguage;
      }
      cmaRequirements.accessNeeds = {
        isInterpreterServicesNeeded,
        isHearingRoomNeeded,
        isHearingLoopNeeded,
        interpreterLanguage
      };
    }

    // Other Needs section
    if (caseData.multimediaEvidence) {

      let multimediaEvidence: boolean = yesNoToBool(caseData.multimediaEvidence);
      let bringOwnMultimediaEquipment: boolean = null;
      let bringOwnMultimediaEquipmentReason: string = null;
      let singleSexAppointment: boolean = yesNoToBool(caseData.singleSexCourt);
      let singleSexTypeAppointment: 'All female' | 'All male' = null;
      let singleSexAppointmentReason: string = null;
      let privateAppointment: boolean = yesNoToBool(caseData.inCameraCourt);
      let privateAppointmentReason: string = null;
      let healthConditions: boolean = yesNoToBool(caseData.physicalOrMentalHealthIssues);
      let healthConditionsReason: string = null;
      let pastExperiences: boolean = yesNoToBool(caseData.pastExperiences);
      let pastExperiencesReason: string = null;
      let anythingElse: boolean = yesNoToBool(caseData.additionalRequests);
      let anythingElseReason: string = null;

      if (multimediaEvidence) {
        if (caseData.multimediaEvidenceDescription) {
          bringOwnMultimediaEquipment = false;
          bringOwnMultimediaEquipmentReason = caseData.multimediaEvidenceDescription;
        }
      }

      if (singleSexAppointment) {
        singleSexTypeAppointment = caseData.singleSexCourtType;
        singleSexAppointmentReason = caseData.singleSexCourtTypeDescription;
      }

      if (privateAppointment) {
        privateAppointmentReason = caseData.inCameraCourtDescription;
      }

      if (healthConditions) {
        healthConditionsReason = caseData.physicalOrMentalHealthIssuesDescription;
      }

      if (pastExperiences) {
        pastExperiencesReason = caseData.pastExperiencesDescription;
      }

      if (anythingElse) {
        anythingElseReason = caseData.additionalRequestsDescription;
      }

      cmaRequirements.otherNeeds = {
        multimediaEvidence,
        bringOwnMultimediaEquipment,
        bringOwnMultimediaEquipmentReason,
        singleSexAppointment,
        singleSexTypeAppointment,
        singleSexAppointmentReason,
        privateAppointment,
        privateAppointmentReason,
        healthConditions,
        healthConditionsReason,
        pastExperiences,
        pastExperiencesReason,
        anythingElse,
        anythingElseReason
      };
    }

    // TODO: How do you ensure the ccdData is rightly mapped to either CMA or CMA and hearing requirement fields
    //  as they use the common fields. What do you assign it to??
    // Other Needs section
    if (caseData.datesToAvoid) {
      let isDateCannotAttend: boolean = null;
      let dates: CmaDateToAvoid[] = null;
      if (caseData.datesToAvoid.length) {
        isDateCannotAttend = true;
        dates = caseData.datesToAvoid.map((d) => {
          return {
            date: this.getDate(d.value.dateToAvoid),
            reason: d.value.dateToAvoidReason
          };
        }
        );

      }

      cmaRequirements.datesToAvoid = {
        isDateCannotAttend,
        dates
      };
    }

    // hearing dates to avoid section
    if (caseData.datesToAvoid) {
      let isDateCannotAttend: boolean = null;
      let dates: CmaDateToAvoid[] = null;
      if (caseData.datesToAvoid.length) {
        isDateCannotAttend = true;
        dates = caseData.datesToAvoid.map((d) => {
          return {
            date: this.getDate(d.value.dateToAvoid),
            reason: d.value.dateToAvoidReason
          };
        }
        );

      }

      hearingRequirements.datesToAvoid = {
        isDateCannotAttend,
        dates
      };
    }

    if (caseData.isWitnessesAttending) {
      hearingRequirements.witnessesOnHearing = yesNoToBool(caseData.isWitnessesAttending);
    }
    if (caseData.isAppellantAttendingTheHearing) {
      hearingRequirements.isAppellantAttendingTheHearing = yesNoToBool(caseData.isAppellantAttendingTheHearing);
    }
    if (caseData.isAppellantGivingOralEvidence) {
      hearingRequirements.isAppellantGivingOralEvidence = yesNoToBool(caseData.isAppellantGivingOralEvidence);
    }
    if (caseData.isWitnessesAttending) {
      hearingRequirements.witnessesOnHearing = yesNoToBool(caseData.isWitnessesAttending);
    }
    if (caseData.isEvidenceFromOutsideUkInCountry) {
      hearingRequirements.witnessesOutsideUK = yesNoToBool(caseData.isEvidenceFromOutsideUkInCountry);
    }
    if (caseData.witnessDetails && caseData.witnessDetails.length) {
      hearingRequirements.witnessNames = caseData.witnessDetails.map(detail => {
        return {
          witnessGivenNames: detail.value.witnessName,
          witnessFamilyName: detail.value.witnessFamilyName
        };
      });
    }

    if (caseData.isHearingLoopNeeded) {
      hearingRequirements.isHearingLoopNeeded = yesNoToBool(caseData.isHearingLoopNeeded);
    }

    if (caseData.isHearingRoomNeeded) {
      hearingRequirements.isHearingRoomNeeded = yesNoToBool(caseData.isHearingRoomNeeded);
    }

    if (caseData.isInterpreterServicesNeeded) {
      hearingRequirements.isInterpreterServicesNeeded = yesNoToBool(caseData.isInterpreterServicesNeeded);
    }

    if (caseData.appellantInterpreterLanguageCategory) {
      hearingRequirements.appellantInterpreterLanguageCategory = caseData.appellantInterpreterLanguageCategory;
    }

    if (caseData.appellantInterpreterSpokenLanguage) {
      hearingRequirements.appellantInterpreterSpokenLanguage = caseData.appellantInterpreterSpokenLanguage;
    }

    if (caseData.appellantInterpreterSignLanguage) {
      hearingRequirements.appellantInterpreterSignLanguage = caseData.appellantInterpreterSignLanguage;
    }

    if (caseData.interpreterLanguage) {
      hearingRequirements.interpreterLanguages = caseData.interpreterLanguage.map(additionalLanguage => {
        return {
          language: additionalLanguage.value.language,
          languageDialect: additionalLanguage.value.languageDialect
        } as InterpreterLanguage;
      });
    }

    if (caseData.remoteVideoCall) {
      this.mapHearingOtherNeedsFromCCDCase(caseData, hearingRequirements);
    }
    const appeal: Appeal = {
      ccdCaseId: ccdCase.id,
      appealStatus: ccdCase.state,
      appealCreatedDate: ccdCase.created_date,
      appealLastModified: ccdCase.last_modified,
      appealReferenceNumber: caseData.appealReferenceNumber,
      removeAppealFromOnlineReason: caseData.removeAppealFromOnlineReason,
      removeAppealFromOnlineDate: formatDate(caseData.removeAppealFromOnlineDate),
      isDecisionAllowed: caseData.isDecisionAllowed,
      appealOutOfCountry: caseData.appealOutOfCountry,
      nonStandardDirectionEnabled: true,
      readonlyApplicationEnabled: true,
      application: {
        appellantOutOfCountryAddress: caseData.appellantOutOfCountryAddress,
        homeOfficeRefNumber: caseData.homeOfficeReferenceNumber,
        appellantInUk: caseData.appellantInUk,
        gwfReferenceNumber: caseData.gwfReferenceNumber,
        outsideUkWhenApplicationMade: caseData.outsideUkWhenApplicationMade,
        dateClientLeaveUk,
        appealType: caseData.appealType || null,
        contactDetails: {
          ...appellantContactDetails
        },
        hasSponsor: caseData.hasSponsor,
        sponsorGivenNames: caseData.sponsorGivenNames,
        sponsorFamilyName: caseData.sponsorFamilyName,
        sponsorNameForDisplay: caseData.sponsorNameForDisplay,
        sponsorAddress: sponsorAddress,
        sponsorContactDetails: {
          ...sponsorContactDetails
        },
        sponsorAuthorisation: caseData.sponsorAuthorisation,
        dateLetterSent,
        decisionLetterReceivedDate,
        isAppealLate: caseData.submissionOutOfTime ? yesNoToBool(caseData.submissionOutOfTime) : undefined,
        lateAppeal: outOfTimeAppeal || undefined,
        personalDetails: {
          givenNames: caseData.appellantGivenNames,
          familyName: caseData.appellantFamilyName,
          dob: dateOfBirth,
          nationality: caseData.appellantNationalities ? caseData.appellantNationalities[0].value.code : null,
          ...caseData.appellantStateless && { stateless: caseData.appellantStateless },
          address: appellantAddress
        },
        addressLookup: {},
        ...caseData.uploadTheNoticeOfDecisionDocs && { homeOfficeLetter: this.mapCaseDataDocumentsToAppealEvidences(caseData.uploadTheNoticeOfDecisionDocs, documentMap) },
        ...caseData.rpDcAppealHearingOption && { rpDcAppealHearingOption: caseData.rpDcAppealHearingOption },
        ...caseData.decisionHearingFeeOption && { decisionHearingFeeOption: caseData.decisionHearingFeeOption }
      },
      reasonsForAppeal: {
        applicationReason: caseData.reasonsForAppealDecision,
        evidences: reasonsForAppealDocumentUploads,
        uploadDate: caseData.reasonsForAppealDateUploaded
      },
      ...(_.has(caseData, 'directions')) && { directions },
      ...draftClarifyingQuestionsAnswers && { draftClarifyingQuestionsAnswers },
      ...caseData.clarifyingQuestionsAnswers && { clarifyingQuestionsAnswers: this.mapCcdClarifyingQuestionsToAppeal(caseData.clarifyingQuestionsAnswers, documentMap) },
      cmaRequirements,
      hearingRequirements,
      askForMoreTime: {
        ...(_.has(caseData, 'submitTimeExtensionReason')) && { reason: caseData.submitTimeExtensionReason },
        inFlight: hasPendingTimeExtension
      },
      hearing: {
        hearingCentre: listHearingCentre,
        time: listHearingLength,
        date: listHearingDate
      },
      ...caseData.respondentDocuments && { respondentDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.respondentDocuments, documentMap) },
      ...caseData.hearingDocuments && { hearingDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.hearingDocuments, documentMap) },
      ...caseData.legalRepresentativeDocuments && { legalRepresentativeDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.legalRepresentativeDocuments, documentMap) },
      ...caseData.additionalEvidenceDocuments && { additionalEvidenceDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.additionalEvidenceDocuments, documentMap) },
      ...caseData.addendumEvidenceDocuments && { addendumEvidenceDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.addendumEvidenceDocuments, documentMap) },
      ...caseData.tribunalDocuments && { tribunalDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.tribunalDocuments, documentMap) },
      ...caseData.hearingDocuments && { hearingDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.hearingDocuments, documentMap) },
      ...caseData.finalDecisionAndReasonsDocuments && { finalDecisionAndReasonsDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.finalDecisionAndReasonsDocuments, documentMap) },
      ...caseData.outOfTimeDecisionType && { outOfTimeDecisionType: caseData.outOfTimeDecisionType },
      ...caseData.outOfTimeDecisionMaker && { outOfTimeDecisionMaker: caseData.outOfTimeDecisionMaker },
      ...caseData.makeAnApplications && { makeAnApplications: this.mapMakeApplicationsToSession(caseData.makeAnApplications, documentMap) },
      ...caseData.appealReviewDecisionTitle && { appealReviewDecisionTitle: caseData.appealReviewDecisionTitle },
      ...caseData.appealReviewOutcome && { appealReviewOutcome: caseData.appealReviewOutcome },
      ...caseData.homeOfficeAppealResponseDocument && { homeOfficeAppealResponseDocument: caseData.homeOfficeAppealResponseDocument },
      ...caseData.homeOfficeAppealResponseDescription && { homeOfficeAppealResponseDescription: caseData.homeOfficeAppealResponseDescription },
      ...caseData.homeOfficeAppealResponseEvidence && { homeOfficeAppealResponseEvidence: caseData.homeOfficeAppealResponseEvidence },
      ...caseData.paymentReference && { paymentReference: caseData.paymentReference },
      ...caseData.paymentStatus && { paymentStatus: caseData.paymentStatus },
      ...caseData.paymentDate && { paymentDate: caseData.paymentDate },
      ...caseData.isFeePaymentEnabled && { isFeePaymentEnabled: caseData.isFeePaymentEnabled },
      ...caseData.paAppealTypeAipPaymentOption && { paAppealTypeAipPaymentOption: caseData.paAppealTypeAipPaymentOption },
      ...caseData.pcqId && { pcqId: caseData.pcqId },
      ...caseData.feeWithHearing && { feeWithHearing: caseData.feeWithHearing },
      ...caseData.feeWithoutHearing && { feeWithoutHearing: caseData.feeWithoutHearing },
      ...caseData.feeCode && { feeCode: caseData.feeCode },
      ...caseData.feeDescription && { feeDescription: caseData.feeDescription },
      ...caseData.feeVersion && { feeVersion: caseData.feeVersion },
      ...caseData.feeAmountGbp && { feeAmountGbp: caseData.feeAmountGbp },
      ...caseData.ftpaApplicantType && { ftpaApplicantType: caseData.ftpaApplicantType },
      ...caseData.ftpaAppellantEvidenceDocuments && { ftpaAppellantEvidenceDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaAppellantEvidenceDocuments, documentMap) },
      ...caseData.ftpaAppellantGroundsDocuments && { ftpaAppellantGroundsDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaAppellantGroundsDocuments, documentMap) },
      ...caseData.ftpaAppellantDocuments && { ftpaAppellantDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.ftpaAppellantDocuments, documentMap) },
      ...caseData.ftpaAppellantGrounds && { ftpaAppellantGrounds: caseData.ftpaAppellantGrounds },
      ...caseData.ftpaAppellantApplicationDate && { ftpaAppellantApplicationDate: caseData.ftpaAppellantApplicationDate },
      ...caseData.ftpaAppellantSubmissionOutOfTime && { ftpaAppellantSubmissionOutOfTime: caseData.ftpaAppellantSubmissionOutOfTime },
      ...caseData.ftpaAppellantOutOfTimeExplanation && { ftpaAppellantOutOfTimeExplanation: caseData.ftpaAppellantOutOfTimeExplanation },
      ...caseData.ftpaAppellantOutOfTimeDocuments && { ftpaAppellantOutOfTimeDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaAppellantOutOfTimeDocuments, documentMap) },
      ...caseData.ftpaRespondentEvidenceDocuments && { ftpaRespondentEvidenceDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaRespondentEvidenceDocuments, documentMap) },
      ...caseData.ftpaRespondentGroundsDocuments && { ftpaRespondentGroundsDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaRespondentGroundsDocuments, documentMap) },
      ...caseData.ftpaRespondentOutOfTimeExplanation && { ftpaRespondentOutOfTimeExplanation: caseData.ftpaRespondentOutOfTimeExplanation },
      ...caseData.ftpaRespondentOutOfTimeDocuments && { ftpaRespondentOutOfTimeDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaRespondentOutOfTimeDocuments, documentMap) },
      ...caseData.ftpaRespondentApplicationDate && { ftpaRespondentApplicationDate: caseData.ftpaRespondentApplicationDate },
      ...caseData.ftpaRespondentDecisionOutcomeType && { ftpaRespondentDecisionOutcomeType: caseData.ftpaRespondentDecisionOutcomeType },
      ...caseData.ftpaRespondentDecisionDocument && { ftpaRespondentDecisionDocument: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaRespondentDecisionDocument, documentMap) },
      ...caseData.ftpaRespondentDecisionDate && { ftpaRespondentDecisionDate: caseData.ftpaRespondentDecisionDate },
      ...caseData.ftpaRespondentRjDecisionOutcomeType && { ftpaRespondentRjDecisionOutcomeType: caseData.ftpaRespondentRjDecisionOutcomeType },
      ...caseData.ftpaAppellantRjDecisionOutcomeType && { ftpaAppellantRjDecisionOutcomeType: caseData.ftpaAppellantRjDecisionOutcomeType },
      ...caseData.ftpaAppellantDecisionOutcomeType && { ftpaAppellantDecisionOutcomeType: caseData.ftpaAppellantDecisionOutcomeType },
      ...caseData.ftpaAppellantDecisionDocument && { ftpaAppellantDecisionDocument: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.ftpaAppellantDecisionDocument, documentMap) },
      ...caseData.ftpaAppellantDecisionDate && { ftpaAppellantDecisionDate: caseData.ftpaAppellantDecisionDate },
      hearingCentre: caseData.hearingCentre || null,
      documentMap: documentMap.map(doc => {
        return {
          id: doc.id,
          url: this.formatDocUrl(doc.url)
        };
      })
    };
    return appeal;
  }

  convertToCcdCaseData(appeal: Appeal, paymentsFlag = false) {
    let caseData = {
      journeyType: 'aip'
    } as CaseData;
    if (_.has(appeal, 'application')) {
      if (appeal.application.homeOfficeRefNumber) {
        caseData.homeOfficeReferenceNumber = appeal.application.homeOfficeRefNumber;
      }
      caseData.appellantInUk = String(appeal.application.appellantInUk);

      if (appeal.application.outsideUkWhenApplicationMade) {
        caseData.outsideUkWhenApplicationMade = yesNoToBool(appeal.application.outsideUkWhenApplicationMade) ? YesOrNo.YES : YesOrNo.NO;
      }

      caseData.gwfReferenceNumber = appeal.application.gwfReferenceNumber;

      if (appeal.application.dateLetterSent && appeal.application.dateLetterSent.year) {
        caseData.homeOfficeDecisionDate = toIsoDate(appeal.application.dateLetterSent);
        caseData.submissionOutOfTime = appeal.application.isAppealLate ? YesOrNo.YES : YesOrNo.NO;
      }
      if (appeal.application.decisionLetterReceivedDate && appeal.application.decisionLetterReceivedDate.year) {
        caseData.homeOfficeDecisionDate = toIsoDate(appeal.application.decisionLetterReceivedDate);
        caseData.submissionOutOfTime = appeal.application.isAppealLate ? YesOrNo.YES : YesOrNo.NO;
      }

      if (appeal.application.isAppealLate) {
        caseData.recordedOutOfTimeDecision = 'No';
        if (_.has(appeal.application.lateAppeal, 'reason')) {
          caseData.applicationOutOfTimeExplanation = appeal.application.lateAppeal.reason;
        }
        if (_.has(appeal.application.lateAppeal, 'evidence')) {
          const documentLocationUrl: string = documentIdToDocStoreUrl(appeal.application.lateAppeal.evidence.fileId, appeal.documentMap);
          caseData.applicationOutOfTimeDocument = {
            document_filename: appeal.application.lateAppeal.evidence.name,
            document_url: documentLocationUrl,
            document_binary_url: `${documentLocationUrl}/binary`
          };
        } else {
          caseData.applicationOutOfTimeDocument = null;
        }
      }

      if (appeal.application.personalDetails && appeal.application.personalDetails.givenNames) {
        caseData.appellantGivenNames = appeal.application.personalDetails.givenNames;
      }
      if (appeal.application.personalDetails && appeal.application.personalDetails.familyName) {
        caseData.appellantFamilyName = appeal.application.personalDetails.familyName;
      }
      if (appeal.application.personalDetails.dob && appeal.application.personalDetails.dob.year) {
        caseData.appellantDateOfBirth = toIsoDate(appeal.application.personalDetails.dob);
      }
      if (appeal.application.dateClientLeaveUk && appeal.application.dateClientLeaveUk.year) {
        caseData.dateClientLeaveUk = toIsoDate(appeal.application.dateClientLeaveUk);
      }
      if (appeal.application.decisionLetterReceivedDate && appeal.application.decisionLetterReceivedDate.year) {
        caseData.decisionLetterReceivedDate = toIsoDate(appeal.application.decisionLetterReceivedDate);
      }
      if (appeal.application.personalDetails && appeal.application.personalDetails.nationality) {
        caseData.appellantNationalities = [
          {
            value: {
              code: appeal.application.personalDetails.nationality
            }
          }
        ];
      }
      if (_.has(appeal.application.personalDetails, 'address.line1')) {
        caseData.appellantAddress = {
          AddressLine1: appeal.application.personalDetails.address.line1,
          AddressLine2: appeal.application.personalDetails.address.line2,
          PostTown: appeal.application.personalDetails.address.city,
          County: appeal.application.personalDetails.address.county,
          PostCode: appeal.application.personalDetails.address.postcode,
          Country: 'United Kingdom'
        };
        caseData.appellantHasFixedAddress = 'Yes';
      }

      if (appeal.application.appellantOutOfCountryAddress) {
        caseData.appellantOutOfCountryAddress = appeal.application.appellantOutOfCountryAddress;
      }

      if (appeal.application.appealType) {
        caseData.appealType = appeal.application.appealType;
      }

      if (appeal.application.contactDetails && (appeal.application.contactDetails.email || appeal.application.contactDetails.phone)) {
        const subscription: Subscription = {
          subscriber: Subscriber.APPELLANT,
          wantsEmail: YesOrNo.NO,
          email: null,
          wantsSms: YesOrNo.NO,
          mobileNumber: null
        };

        if (appeal.application.contactDetails.wantsEmail === true && appeal.application.contactDetails.email) {
          subscription.wantsEmail = YesOrNo.YES;
          subscription.email = appeal.application.contactDetails.email;
          caseData.appellantEmailAddress = appeal.application.contactDetails.email;
        }
        if (appeal.application.contactDetails.wantsSms === true && appeal.application.contactDetails.phone) {
          subscription.wantsSms = YesOrNo.YES;
          subscription.mobileNumber = appeal.application.contactDetails.phone;
          caseData.appellantPhoneNumber = appeal.application.contactDetails.phone;
        }
        caseData.subscriptions = [{ value: subscription }];

        if (appeal.application.hasSponsor) {
          caseData.hasSponsor = appeal.application.hasSponsor;
        }

        if (appeal.application.sponsorGivenNames) {
          caseData.sponsorGivenNames = appeal.application.sponsorGivenNames;
        }

        if (appeal.application.sponsorFamilyName) {
          caseData.sponsorFamilyName = appeal.application.sponsorFamilyName;
        }

        if (appeal.application.sponsorNameForDisplay) {
          caseData.sponsorNameForDisplay = appeal.application.sponsorNameForDisplay;
        }

        if (appeal.application.sponsorAddress) {
          caseData.sponsorAddress = {
            AddressLine1: appeal.application.sponsorAddress.line1,
            AddressLine2: appeal.application.sponsorAddress.line2,
            PostTown: appeal.application.sponsorAddress.city,
            County: appeal.application.sponsorAddress.county,
            PostCode: appeal.application.sponsorAddress.postcode,
            Country: 'United Kingdom'
          };
        }

        if (appeal.application.sponsorContactDetails && (appeal.application.sponsorContactDetails.email || appeal.application.sponsorContactDetails.phone)) {
          const sponsorSubscription: Subscription = {
            subscriber: Subscriber.SUPPORTER,
            wantsEmail: YesOrNo.NO,
            email: null,
            wantsSms: YesOrNo.NO,
            mobileNumber: null
          };

          if (appeal.application.sponsorContactDetails.wantsEmail === true && appeal.application.sponsorContactDetails.email) {
            sponsorSubscription.wantsEmail = YesOrNo.YES;
            sponsorSubscription.email = appeal.application.sponsorContactDetails.email;
            caseData.sponsorEmail = appeal.application.sponsorContactDetails.email;
          }
          if (appeal.application.sponsorContactDetails.wantsSms === true && appeal.application.sponsorContactDetails.phone) {
            sponsorSubscription.wantsSms = YesOrNo.YES;
            sponsorSubscription.mobileNumber = appeal.application.sponsorContactDetails.phone;
            caseData.sponsorMobileNumber = appeal.application.sponsorContactDetails.phone;
          }
          caseData.sponsorSubscriptions = [{ value: sponsorSubscription }];
        }

        if (appeal.application.sponsorAuthorisation) {
          caseData.sponsorAuthorisation = appeal.application.sponsorAuthorisation;
        }
      }
    }

    if (_.has(appeal, 'reasonsForAppeal')) {
      if (appeal.reasonsForAppeal.applicationReason) {
        caseData.reasonsForAppealDecision = appeal.reasonsForAppeal.applicationReason;
      }
      if (appeal.reasonsForAppeal.evidences) {
        const evidences: Evidence[] = appeal.reasonsForAppeal.evidences;

        caseData.reasonsForAppealDocuments = evidences.map((evidence) => {
          const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, appeal.documentMap);
          return {
            value: {
              dateUploaded: evidence.dateUploaded,
              description: evidence.description,
              tag: 'additionalEvidence',
              document: {
                document_filename: evidence.name,
                document_url: documentLocationUrl,
                document_binary_url: `${documentLocationUrl}/binary`
              }
            } as DocumentWithMetaData
          };
        });

        if (appeal.reasonsForAppeal.uploadDate) {
          caseData.reasonsForAppealDateUploaded = appeal.reasonsForAppeal.uploadDate;
        }
      }
    }

    if (_.has(appeal, 'cmaRequirements')) {

      // Access Needs Section
      if (_.has(appeal, 'cmaRequirements.accessNeeds')) {
        const { accessNeeds } = appeal.cmaRequirements;
        if (_.has(accessNeeds, 'isInterpreterServicesNeeded')) {
          caseData.isInterpreterServicesNeeded = boolToYesNo(accessNeeds.isInterpreterServicesNeeded);
        }

        if (_.get(accessNeeds, 'isInterpreterServicesNeeded')) {
          if (_.has(accessNeeds, 'interpreterLanguage')) {
            caseData.interpreterLanguage = [{
              value: {
                language: accessNeeds.interpreterLanguage.language,
                languageDialect: accessNeeds.interpreterLanguage.languageDialect || null
              }
            }];
          }
        }

        if (_.has(accessNeeds, 'isHearingLoopNeeded')) {
          caseData.isHearingLoopNeeded = boolToYesNo(accessNeeds.isHearingLoopNeeded);
        }

        if (_.has(accessNeeds, 'isHearingRoomNeeded')) {
          caseData.isHearingRoomNeeded = boolToYesNo(accessNeeds.isHearingRoomNeeded);
        }
      }

      // Other Needs Section
      if (_.has(appeal, 'cmaRequirements.otherNeeds')) {
        const { otherNeeds } = appeal.cmaRequirements;

        if (_.has(otherNeeds, 'multimediaEvidence')) {
          caseData.multimediaEvidence = boolToYesNo(otherNeeds.multimediaEvidence);

          if (!otherNeeds.bringOwnMultimediaEquipment && !isEmpty(otherNeeds.bringOwnMultimediaEquipmentReason)) {
            caseData.multimediaEvidenceDescription = otherNeeds.bringOwnMultimediaEquipmentReason;
          }
        }
        if (_.has(otherNeeds, 'singleSexAppointment')) {
          caseData.singleSexCourt = boolToYesNo(otherNeeds.singleSexAppointment);

          if (otherNeeds.singleSexAppointment && otherNeeds.singleSexTypeAppointment) {
            caseData.singleSexCourtType = otherNeeds.singleSexTypeAppointment;
            if (!isEmpty(otherNeeds.singleSexAppointmentReason)) {
              caseData.singleSexCourtTypeDescription = otherNeeds.singleSexAppointmentReason;
            }
          }
        }

        if (_.has(otherNeeds, 'privateAppointment')) {
          caseData.inCameraCourt = boolToYesNo(otherNeeds.privateAppointment);

          if (otherNeeds.privateAppointment && !isEmpty(otherNeeds.privateAppointmentReason)) {
            caseData.inCameraCourtDescription = otherNeeds.privateAppointmentReason;
          }
        }
        if (_.has(otherNeeds, 'healthConditions')) {
          caseData.physicalOrMentalHealthIssues = boolToYesNo(otherNeeds.healthConditions);

          if (otherNeeds.healthConditions && !isEmpty(otherNeeds.healthConditionsReason)) {
            caseData.physicalOrMentalHealthIssuesDescription = otherNeeds.healthConditionsReason;
          }
        }
        if (_.has(otherNeeds, 'pastExperiences')) {
          caseData.pastExperiences = boolToYesNo(otherNeeds.pastExperiences);

          if (otherNeeds.pastExperiences && !isEmpty(otherNeeds.pastExperiencesReason)) {
            caseData.pastExperiencesDescription = otherNeeds.pastExperiencesReason;
          }
        }

        if (_.has(otherNeeds, 'anythingElse')) {
          caseData.additionalRequests = boolToYesNo(otherNeeds.anythingElse);

          if (otherNeeds.pastExperiences && !isEmpty(otherNeeds.anythingElseReason)) {
            caseData.additionalRequestsDescription = otherNeeds.anythingElseReason;
          }
        }
      }
      // Dates To avoid Section
      if (_.has(appeal, 'cmaRequirements.datesToAvoid')) {
        const { datesToAvoid } = appeal.cmaRequirements;

        if (_.has(datesToAvoid, 'isDateCannotAttend')) {
          caseData.datesToAvoidYesNo = boolToYesNo(datesToAvoid.isDateCannotAttend);

          if (datesToAvoid.isDateCannotAttend && datesToAvoid.dates && datesToAvoid.dates.length) {
            caseData.datesToAvoid = datesToAvoid.dates.map(date => {

              return {
                value: {
                  dateToAvoid: toIsoDate(date.date),
                  dateToAvoidReason: date.reason
                } as DateToAvoid
              } as Collection<DateToAvoid>;
            }
            );
          }
        }
      }
    }

    if (_.has(appeal, 'hearingRequirements')) {
      if (_.has(appeal.hearingRequirements, 'witnessesOnHearing')) {
        caseData.isWitnessesAttending = boolToYesNo(appeal.hearingRequirements.witnessesOnHearing);
      }
      if (_.has(appeal.hearingRequirements, 'isAppellantAttendingTheHearing')) {
        caseData.isAppellantAttendingTheHearing = boolToYesNo(appeal.hearingRequirements.isAppellantAttendingTheHearing);
      }
      if (_.has(appeal.hearingRequirements, 'isAppellantGivingOralEvidence')) {
        caseData.isAppellantGivingOralEvidence = boolToYesNo(appeal.hearingRequirements.isAppellantGivingOralEvidence);
      }

      if (_.has(appeal.hearingRequirements, 'witnessesOutsideUK')) {
        caseData.isEvidenceFromOutsideUkInCountry = boolToYesNo(appeal.hearingRequirements.witnessesOutsideUK);
      }

      if (_.has(appeal.hearingRequirements, 'witnessNames')) {
        caseData.witnessDetails = appeal.hearingRequirements.witnessNames.map(name => {
          return {
            value: {
              witnessName: name.witnessGivenNames,
              witnessFamilyName: name.witnessFamilyName
            } as WitnessDetails
          } as Collection<WitnessDetails>;
        });
      }

      if (_.has(appeal.hearingRequirements, 'isInterpreterServicesNeeded')) {
        caseData.isInterpreterServicesNeeded = boolToYesNo(appeal.hearingRequirements.isInterpreterServicesNeeded);

      if (_.has(appeal.hearingRequirements, 'appellantInterpreterLanguageCategory')) {
        caseData.appellantInterpreterLanguageCategory = appeal.hearingRequirements.appellantInterpreterLanguageCategory;
      }
      
      if (_.has(appeal.hearingRequirements, 'appellantInterpreterSpokenLanguage')) {
        caseData.appellantInterpreterSpokenLanguage = appeal.hearingRequirements.appellantInterpreterSpokenLanguage;
      }

      if (_.has(appeal.hearingRequirements, 'appellantInterpreterSignLanguage')) {
        caseData.appellantInterpreterSignLanguage = appeal.hearingRequirements.appellantInterpreterSignLanguage;
      }

        if (_.has(appeal.hearingRequirements, 'interpreterLanguages')) {
          caseData.interpreterLanguage = appeal.hearingRequirements.interpreterLanguages.map(interpreterLanguage => {
            return {
              value: {
                language: interpreterLanguage.language,
                languageDialect: interpreterLanguage.languageDialect || null
              } as AdditionalLanguage
            } as Collection<AdditionalLanguage>;
          });
        }
      }

      caseData.isHearingRoomNeeded = null;
      if (_.has(appeal.hearingRequirements, 'isHearingRoomNeeded')) {
        if (appeal.hearingRequirements.isHearingRoomNeeded != null) {
          caseData.isHearingRoomNeeded = boolToYesNo(appeal.hearingRequirements.isHearingRoomNeeded);
        }
      }

      caseData.isHearingLoopNeeded = null;
      if (_.has(appeal.hearingRequirements, 'isHearingLoopNeeded')) {
        if (appeal.hearingRequirements.isHearingLoopNeeded != null) {
          caseData.isHearingLoopNeeded = boolToYesNo(appeal.hearingRequirements.isHearingLoopNeeded);
        }
      }

      if (_.has(appeal, 'hearingRequirements.otherNeeds')) {
        this.mapToCCDCaseHearingRequirementsOtherNeeds(appeal, caseData);
      }

      // Dates To avoid Section
      if (_.has(appeal, 'hearingRequirements.datesToAvoid')) {
        const { datesToAvoid } = appeal.hearingRequirements;

        if (_.has(datesToAvoid, 'isDateCannotAttend')) {
          caseData.datesToAvoidYesNo = boolToYesNo(datesToAvoid.isDateCannotAttend);

          if (datesToAvoid.isDateCannotAttend && datesToAvoid.dates && datesToAvoid.dates.length) {
            caseData.datesToAvoid = datesToAvoid.dates.map(date => {

              return {
                value: {
                  dateToAvoid: toIsoDate(date.date),
                  dateToAvoidReason: date.reason
                } as DateToAvoid
              } as Collection<DateToAvoid>;
            });
          }
        }
      }

      if (_.has(appeal, 'isDecisionAllowed')) {
        caseData.isDecisionAllowed = appeal.isDecisionAllowed;
      }
    }

    const askForMoreTime = appeal.askForMoreTime;
    if (askForMoreTime && askForMoreTime.reason) {
      this.addCcdTimeExtension(askForMoreTime, appeal, caseData);
    }
    caseData = {
      ...caseData,
      ...appeal.application.personalDetails.stateless && { appellantStateless: appeal.application.personalDetails.stateless },
      ...paymentsFlag && { rpDcAppealHearingOption: appeal.application.rpDcAppealHearingOption || null },
      ...paymentsFlag && { decisionHearingFeeOption: appeal.application.decisionHearingFeeOption || null },
      ...appeal.paymentReference && { paymentReference: appeal.paymentReference },
      ...appeal.paymentStatus && { paymentStatus: appeal.paymentStatus },
      ...appeal.paymentDate && { paymentDate: appeal.paymentDate },
      ...appeal.isFeePaymentEnabled && { isFeePaymentEnabled: appeal.isFeePaymentEnabled },
      ...paymentsFlag && { paAppealTypeAipPaymentOption: appeal.paAppealTypeAipPaymentOption || null },
      ...paymentsFlag && { pcqId: appeal.pcqId || null },
      ...appeal.draftClarifyingQuestionsAnswers && {
        draftClarifyingQuestionsAnswers: this.mapAppealClarifyingQuestionsToCcd(appeal.draftClarifyingQuestionsAnswers, appeal.documentMap)
      },
      ...appeal.clarifyingQuestionsAnswers && {
        clarifyingQuestionsAnswers: this.mapAppealClarifyingQuestionsToCcd(appeal.clarifyingQuestionsAnswers, appeal.documentMap)
      },
      ...appeal.application.homeOfficeLetter && {
        uploadTheNoticeOfDecisionDocs: this.mapUploadTheNoticeOfDecisionDocs(appeal.application.homeOfficeLetter, appeal.documentMap, 'additionalEvidence')
      },
      ...appeal.additionalEvidence && {
        additionalEvidence: this.mapAdditionalEvidenceDocumentsToDocumentsCaseData(appeal.additionalEvidence, appeal.documentMap)
      },
      ...appeal.addendumEvidence && {
        addendumEvidence: this.mapAdditionalEvidenceDocumentsToDocumentsCaseData(appeal.addendumEvidence, appeal.documentMap)
      },
      ...appeal.makeAnApplicationTypes && { makeAnApplicationTypes: appeal.makeAnApplicationTypes },
      ...appeal.makeAnApplicationDetails && { makeAnApplicationDetails: appeal.makeAnApplicationDetails },
      ...appeal.makeAnApplicationEvidence && { makeAnApplicationEvidence: this.mapAppealEvidencesToDocumentsCaseData(appeal.makeAnApplicationEvidence, appeal.documentMap) },
      ...appeal.ftpaAppellantEvidenceDocuments && {
        ftpaAppellantEvidenceDocuments: this.mapAdditionalEvidenceDocumentsToDocumentsCaseData(appeal.ftpaAppellantEvidenceDocuments, appeal.documentMap, 'ftpaAppellantEvidenceDocuments')
      },
      ...appeal.ftpaAppellantOutOfTimeDocuments && {
        ftpaAppellantOutOfTimeDocuments: this.mapAdditionalEvidenceDocumentsToDocumentsCaseData(appeal.ftpaAppellantOutOfTimeDocuments, appeal.documentMap, 'ftpaAppellantOutOfTimeDocuments')
      },
      ...appeal.ftpaAppellantGrounds && { ftpaAppellantGrounds: appeal.ftpaAppellantGrounds },
      ...appeal.ftpaAppellantOutOfTimeExplanation && { ftpaAppellantOutOfTimeExplanation: appeal.ftpaAppellantOutOfTimeExplanation },
      ...appeal.ftpaAppellantSubmissionOutOfTime && { ftpaAppellantSubmissionOutOfTime: appeal.ftpaAppellantSubmissionOutOfTime }
    };
    return caseData;
  }

  mapAdditionalEvidenceDocumentsToDocumentsCaseData = (evidences: AdditionalEvidenceDocument[], documentMap: DocumentMap[], description = 'additionalEvidenceDocument'): Collection<Document>[] => {
    return evidences.map((evidence: AdditionalEvidenceDocument) => {
      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, documentMap);
      return {
        id: evidence.fileId,
        value: {
          description: evidence.description || description,
          document: {
            document_filename: evidence.name,
            document_url: documentLocationUrl,
            document_binary_url: `${documentLocationUrl}/binary`
          }
        }
        // } as Document;
      } as Collection<Document>;
    });
  }

  mapAppealEvidencesToDocumentsCaseData = (evidences: Evidence[], documentMap: DocumentMap[]): Collection<SupportingDocument>[] => {
    return evidences.map((evidence) => {
      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, documentMap);
      return {
        ...evidence.id && { id: evidence.id },
        value: {
          document_filename: evidence.name,
          document_url: documentLocationUrl,
          document_binary_url: `${documentLocationUrl}/binary`
        } as SupportingDocument
      } as Collection<SupportingDocument>;
    });
  }

  mapUploadTheNoticeOfDecisionDocs = (evidences: Evidence[], documentMap: DocumentMap[], tag: string = null): Collection<DocumentWithMetaData>[] => {
    return evidences.map((evidence: Evidence) => {
      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, documentMap);
      return {
        ...evidence.fileId && { id: evidence.fileId },
        value: {
          ...evidence.description && { description: evidence.description },
          ...evidence.dateUploaded && { dateUploaded: evidence.dateUploaded },
          ...tag && { tag: 'additionalEvidence' },
          document: {
            document_filename: evidence.name,
            document_url: documentLocationUrl,
            document_binary_url: `${documentLocationUrl}/binary`
          }
        }
      } as Collection<DocumentWithMetaData>;
    });
  }

  mapCaseDataDocumentsToAppealEvidences = (documents: Collection<DocumentWithMetaData>[], documentMap: DocumentMap[]): Evidence[] => {
    return documents.map(document => {
      const documentMapperId: string = addToDocumentMapper(document.value.document.document_url, documentMap);
      return {
        id: document.id,
        fileId: documentMapperId,
        name: document.value.document.document_filename,
        ...document.value.dateUploaded && { dateUploaded: document.value.dateUploaded },
        ...document.value.description && { description: document.value.description }
      } as Evidence;
    });
  }

  private mapCcdClarifyingQuestionsToAppeal(clarifyingQuestions: ClarifyingQuestion<Collection<SupportingDocument>>[], documentMap: DocumentMap[]): ClarifyingQuestion<Evidence>[] {
    return clarifyingQuestions.map(answer => {
      let evidencesList: Evidence[] = [];
      if (answer.value.supportingEvidence) {
        evidencesList = answer.value.supportingEvidence.map(e => this.mapSupportingDocumentToEvidence(e, documentMap));
      }
      return {
        id: answer.id,
        value: {
          dateSent: answer.value.dateSent,
          dueDate: answer.value.dueDate,
          question: answer.value.question,
          answer: answer.value.answer || '',
          dateResponded: answer.value.dateResponded,
          supportingEvidence: evidencesList,
          directionId: answer.value.directionId
        }
      };
    });
  }

  private mapAppealClarifyingQuestionsToCcd(clarifyingQuestions: ClarifyingQuestion<Evidence>[], documentMap: DocumentMap[]): ClarifyingQuestion<Collection<SupportingDocument>>[] {
    const ccdCQ = clarifyingQuestions.map((answer: ClarifyingQuestion<Evidence>): ClarifyingQuestion<Collection<SupportingDocument>> => {
      let supportingEvidence: Collection<SupportingDocument>[];
      if (answer.value.supportingEvidence) {
        supportingEvidence = answer.value.supportingEvidence.map(evidence => this.mapEvidenceToSupportingDocument(evidence, documentMap));
      }
      return {
        ...answer,
        value: {
          ...answer.value,
          ...answer.value.supportingEvidence && { supportingEvidence }
        }
      };
    });
    return ccdCQ;
  }
  // TODO: remove method if not needed
  private addCcdTimeExtension(askForMoreTime, appeal, caseData) {

    caseData.submitTimeExtensionReason = askForMoreTime.reason;

    if (askForMoreTime.reviewTimeExtensionRequired === YesOrNo.YES) {
      caseData.reviewTimeExtensionRequired = YesOrNo.YES;
    }
    if (askForMoreTime.evidence) {
      caseData.submitTimeExtensionEvidence = this.mapToTimeExtensionEvidenceCollection(askForMoreTime.evidence, appeal);
    }
  }

  private mapSupportingDocumentToEvidence(evidence: Collection<SupportingDocument>, documentMap: DocumentMap[]) {
    const documentMapperId: string = addToDocumentMapper(evidence.value.document_url, documentMap);
    return {
      fileId: documentMapperId,
      name: evidence.value.document_filename
    };
  }

  private mapEvidenceToSupportingDocument(evidence: Evidence, documentMap: DocumentMap[]): Collection<SupportingDocument> {
    const documentUrl: string = documentIdToDocStoreUrl(evidence.fileId, documentMap);
    return {
      value: {
        document_filename: evidence.name,
        document_url: documentUrl,
        document_binary_url: `${documentUrl}/binary`
      }
    };
  }

  private mapToTimeExtensionEvidenceCollection(evidences: Evidence[], appeal: Appeal): TimeExtensionEvidenceCollection[] {
    return evidences ? evidences.map((evidence) => {
      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, appeal.documentMap);
      return {
        value: {
          document_filename: evidence.name,
          document_url: documentLocationUrl,
          document_binary_url: `${documentLocationUrl}/binary`
        } as SupportingDocument
      } as TimeExtensionEvidenceCollection;
    }) : null;
  }

  private mapDocsWithMetadataToEvidenceArray = (docs: Collection<DocumentWithMetaData>[], documentMap: DocumentMap[]): Evidence[] => {
    const evidences = docs.map((doc: Collection<DocumentWithMetaData>): Evidence => {
      const fileId = addToDocumentMapper(doc.value.document.document_url, documentMap);
      return {
        fileId,
        name: doc.value.document.document_filename,
        ...doc.id && { id: doc.id },
        ...doc.value.tag && { tag: doc.value.tag },
        ...doc.value.suppliedBy && { suppliedBy: doc.value.suppliedBy },
        ...doc.value.description && { description: doc.value.description },
        ...doc.value.dateUploaded && { dateUploaded: doc.value.dateUploaded }
      };
    });
    return evidences;
  }

  private mapAdditionalEvidenceToDocumentWithDescriptionArray = (docs: AdditionalEvidence[], documentMap: DocumentMap[]): Evidence[] => {
    const evidences = docs.map((doc: AdditionalEvidence): Evidence => {
      const fileId = addToDocumentMapper(doc.value.document.document_url, documentMap);
      return {
        fileId,
        name: doc.value.document.document_filename,
        ...doc.id && { id: doc.id },
        ...doc.value.tag && { tag: doc.value.tag },
        ...doc.value.suppliedBy && { suppliedBy: doc.value.suppliedBy },
        ...doc.value.uploadedBy && { uploadedBy: doc.value.uploadedBy },
        ...doc.value.description && { description: doc.value.description },
        ...doc.value.dateUploaded && { dateUploaded: moment(new Date(doc.value.dateUploaded)).format('DD MMMM YYYY') }
      };
    });
    return evidences;
  }

  private mapMakeApplicationsToSession = (makeAnApplications: Collection<Application<Collection<SupportingDocument>>>[], documentMap: DocumentMap[]): Collection<Application<Evidence>>[] => {
    return makeAnApplications.map((application) => {
      return {
        id: application.id,
        value: {
          ...application.value,
          ...application.value.evidence && { evidence: application.value.evidence.map(e => this.mapSupportingDocumentToEvidence(e, documentMap)) }
        }
      };
    });
  }

  private mapHearingOtherNeedsFromCCDCase(caseData, hearingRequirements) {

    if (!_.has(hearingRequirements, 'otherNeeds')) {
      hearingRequirements.otherNeeds = {};
    }

    if (caseData.multimediaEvidence) {
      hearingRequirements.otherNeeds.multimediaEvidence = yesNoToBool(caseData.multimediaEvidence);
      if (caseData.bringOwnMultimediaEquipment) {
        hearingRequirements.otherNeeds.bringOwnMultimediaEquipment = yesNoToBool(caseData.bringOwnMultimediaEquipment);
        if (caseData.multimediaEvidenceDescription) {
          hearingRequirements.otherNeeds.bringOwnMultimediaEquipmentReason = caseData.multimediaEvidenceDescription;
        }
      } else if (caseData.multimediaEvidenceDescription) {
        hearingRequirements.otherNeeds.bringOwnMultimediaEquipment = false;
        hearingRequirements.otherNeeds.bringOwnMultimediaEquipmentReason = caseData.multimediaEvidenceDescription;
      } else {
        hearingRequirements.otherNeeds.bringOwnMultimediaEquipment = true;
      }
    }

    if (caseData.singleSexCourt) {
      hearingRequirements.otherNeeds.singleSexAppointment = yesNoToBool(caseData.singleSexCourt);
      if (caseData.singleSexCourtType) {
        hearingRequirements.otherNeeds.singleSexTypeAppointment = caseData.singleSexCourtType;
        hearingRequirements.otherNeeds.singleSexAppointmentReason = caseData.singleSexCourtTypeDescription;
      }
    }

    if (caseData.inCameraCourt) {
      hearingRequirements.otherNeeds.privateAppointment = yesNoToBool(caseData.inCameraCourt);
      if (caseData.inCameraCourtDescription) {
        hearingRequirements.otherNeeds.privateAppointmentReason = caseData.inCameraCourtDescription;
      }
    }

    if (caseData.physicalOrMentalHealthIssues) {
      hearingRequirements.otherNeeds.healthConditions = yesNoToBool(caseData.physicalOrMentalHealthIssues);
      if (caseData.physicalOrMentalHealthIssuesDescription) {
        hearingRequirements.otherNeeds.healthConditionsReason = caseData.physicalOrMentalHealthIssuesDescription;
      }
    }

    if (caseData.pastExperiences) {
      hearingRequirements.otherNeeds.pastExperiences = yesNoToBool(caseData.pastExperiences);
      if (caseData.pastExperiencesDescription) {
        hearingRequirements.otherNeeds.pastExperiencesReason = caseData.pastExperiencesDescription;
      }
    }

    if (caseData.additionalRequests) {
      hearingRequirements.otherNeeds.anythingElse = yesNoToBool(caseData.additionalRequests);
      if (caseData.additionalRequestsDescription) {
        hearingRequirements.otherNeeds.anythingElseReason = caseData.additionalRequestsDescription;
      }
    }

    if (caseData.remoteVideoCall) {
      hearingRequirements.otherNeeds.remoteVideoCall = yesNoToBool(caseData.remoteVideoCall);
      if (caseData.remoteVideoCallDescription) {
        hearingRequirements.otherNeeds.remoteVideoCallDescription = caseData.remoteVideoCallDescription;
      }
    }
  }

  private mapToCCDCaseHearingRequirementsOtherNeeds(appeal, caseData) {
    const { otherNeeds } = appeal.hearingRequirements;

    caseData.multimediaEvidence = null;
    caseData.bringOwnMultimediaEquipment = null;
    caseData.multimediaEvidenceDescription = null;
    caseData.singleSexCourt = null;
    caseData.singleSexCourtType = null;
    caseData.singleSexCourtTypeDescription = null;
    caseData.inCameraCourt = null;
    caseData.inCameraCourtDescription = null;
    caseData.physicalOrMentalHealthIssues = null;
    caseData.physicalOrMentalHealthIssuesDescription = null;
    caseData.pastExperiences = null;
    caseData.pastExperiencesDescription = null;
    caseData.additionalRequests = null;
    caseData.additionalRequestsDescription = null;
    caseData.remoteVideoCall = null;
    caseData.remoteVideoCallDescription = null;

    if (otherNeeds.multimediaEvidence != null) {
      caseData.multimediaEvidence = boolToYesNo(otherNeeds.multimediaEvidence);
      if (otherNeeds.bringOwnMultimediaEquipment != null) {
        caseData.bringOwnMultimediaEquipment = boolToYesNo(otherNeeds.bringOwnMultimediaEquipment);
        if (!otherNeeds.bringOwnMultimediaEquipment && !isEmpty(otherNeeds.bringOwnMultimediaEquipmentReason)) {
          caseData.multimediaEvidenceDescription = otherNeeds.bringOwnMultimediaEquipmentReason;
        }
      }
    }

    if (otherNeeds.singleSexAppointment != null) {
      caseData.singleSexCourt = boolToYesNo(otherNeeds.singleSexAppointment);
      if (otherNeeds.singleSexAppointment && otherNeeds.singleSexTypeAppointment) {
        caseData.singleSexCourtType = otherNeeds.singleSexTypeAppointment;
        if (!isEmpty(otherNeeds.singleSexAppointmentReason)) {
          caseData.singleSexCourtTypeDescription = otherNeeds.singleSexAppointmentReason;
        }
      }
    }

    if (otherNeeds.privateAppointment != null) {
      caseData.inCameraCourt = boolToYesNo(otherNeeds.privateAppointment);
      if (otherNeeds.privateAppointment && !isEmpty(otherNeeds.privateAppointmentReason)) {
        caseData.inCameraCourtDescription = otherNeeds.privateAppointmentReason;
      }
    }

    if (otherNeeds.healthConditions != null) {
      caseData.physicalOrMentalHealthIssues = boolToYesNo(otherNeeds.healthConditions);
      if (otherNeeds.healthConditions && !isEmpty(otherNeeds.healthConditionsReason)) {
        caseData.physicalOrMentalHealthIssuesDescription = otherNeeds.healthConditionsReason;
      }
    }

    if (otherNeeds.pastExperiences != null) {
      caseData.pastExperiences = boolToYesNo(otherNeeds.pastExperiences);
      if (otherNeeds.pastExperiences && !isEmpty(otherNeeds.pastExperiencesReason)) {
        caseData.pastExperiencesDescription = otherNeeds.pastExperiencesReason;
      }
    }

    if (otherNeeds.anythingElse != null) {
      caseData.additionalRequests = boolToYesNo(otherNeeds.anythingElse);
      if (otherNeeds.anythingElse && !isEmpty(otherNeeds.anythingElseReason)) {
        caseData.additionalRequestsDescription = otherNeeds.anythingElseReason;
      }
    }

    if (otherNeeds.remoteVideoCall != null) {
      caseData.remoteVideoCall = boolToYesNo(otherNeeds.remoteVideoCall);
      if (!otherNeeds.remoteVideoCall && !isEmpty(otherNeeds.remoteVideoCallDescription)) {
        caseData.remoteVideoCallDescription = otherNeeds.remoteVideoCallDescription;
      }
    }
  }

  private formatDocUrl(docUrl: string): string {
    if (process.env.NODE_ENV === 'development') {
      return `${process.env.DOC_MANAGEMENT_URL}/documents${docUrl.substring(docUrl.lastIndexOf('/'))}`;
    }
    return docUrl;
  }
}
