import { Request } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { FEATURE_FLAGS } from '../data/constants';
import { formatDate } from '../utils/date-utils';
import { boolToYesNo, documentIdToDocStoreUrl, extendedBoolToYesNo, toIsoDate, yesNoToBool } from '../utils/utils';
import { AuthenticationService, SecurityHeaders } from './authentication-service';
import { CcdService } from './ccd-service';
import { DocumentManagementService } from './document-management-service';
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
  private readonly _documentManagementService: DocumentManagementService;

  constructor(ccdService: CcdService, authenticationService: AuthenticationService, s2sService: S2SService = null, documentManagementService: DocumentManagementService) {
    this._ccdService = ccdService;
    this._authenticationService = authenticationService;
    this._s2sService = s2sService;
    this._documentManagementService = documentManagementService;
  }

  getCcdService(): CcdService {
    return this._ccdService;
  }

  getAuthenticationService(): AuthenticationService {
    return this._authenticationService;
  }

  async loadAppealsList(req: Request) {
    const securityHeaders: SecurityHeaders = await this._authenticationService.getSecurityHeaders(req);
    const data = await this._ccdService.loadCasesListForUser(req.idam.userDetails.uid, securityHeaders);
    if (data.total > 0) {
      req.session.casesList = data.cases.map((c: CcdCaseDetails) => ({
        id: c.id,
        appealReferenceNumber: c.case_data.appealReferenceNumber || '',
        state: c.state,
        appellantGivenNames: c.case_data.appellantGivenNames || '',
        appellantFamilyName: c.case_data.appellantFamilyName || ''
      }));
    } else {
      req.session.casesList = [];
    }
  }

  async createNewAppeal(req: Request): Promise<Appeal> {
    const securityHeaders: SecurityHeaders = await this._authenticationService.getSecurityHeaders(req);
    const ccdCase = await this._ccdService.createCase(req.idam.userDetails.uid, securityHeaders);
    req.session.ccdCaseId = ccdCase.id;
    req.session.appeal = this.mapCcdCaseToAppeal(ccdCase);
    return req.session.appeal;
  }

  async loadAppealByCaseId(caseId: string, req: Request): Promise<Appeal> {
    const securityHeaders: SecurityHeaders = await this._authenticationService.getSecurityHeaders(req);
    const ccdCase = await this._ccdService.loadCaseById(req.idam.userDetails.uid, caseId, securityHeaders);
    req.session.ccdCaseId = caseId;
    req.session.appeal = this.mapCcdCaseToAppeal(ccdCase);
    return req.session.appeal;
  }

  private getDate(ccdDate): AppealDate {
    if (ccdDate) {
      const decisionDate = new Date(ccdDate);
      const dateLetterSent = {
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

  async submitEventRefactored(event, appeal: Appeal, uid: string, userToken: string, paymentsFlag = false, refundFlag = false): Promise<Appeal> {
    const securityHeaders: SecurityHeaders = {
      userToken: `Bearer ${userToken}`,
      serviceToken: await this._s2sService.getServiceToken()
    };
    const caseData: CaseData = this.convertToCcdCaseData(appeal, paymentsFlag, refundFlag);
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
    let reheardRule35AppellantDocument: Evidence = null;
    let reheardRule35RespondentDocument: Evidence = null;
    let ftpaApplicationRespondentDocument: Evidence = null;
    let ftpaApplicationAppellantDocument: Evidence = null;
    let requestClarifyingQuestionsDirection: Collection<CcdDirection>;
    const cmaRequirements: CmaRequirements = {};
    const hearingRequirements: HearingRequirements = {};
    let draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[];
    const hasPendingTimeExtension = false;
    const documentMap: DocumentMap[] = [];
    let updatedDecisionAndReasons: DecisionAndReasons[] = null;
    let rule32NoticeDocs: Evidence = null;
    let previousRemissionDetails: RemissionDetails[] = null;
    let remittalDocuments: RemittalDetails[] = null;

    const appellantContactDetails = subscriptions.reduce((contactDetails, subscription) => {
      const value = subscription.value;
      if (Subscriber.APPELLANT.valueOf() === value.subscriber) {
        return {
          email: value.email || null,
          wantsEmail: (YesOrNo.YES.valueOf() === value.wantsEmail),
          phone: value.mobileNumber || null,
          wantsSms: (YesOrNo.YES.valueOf() === value.wantsSms)
        };
      }
    }, {}) || { email: null, wantsEmail: false, phone: null, wantsSms: false };

    const sponsorContactDetails = sponsorSubscriptions.reduce((scd, sponsorSubscription) => {
      const value = sponsorSubscription.value;
      return {
        email: value.email || null,
        wantsEmail: (YesOrNo.YES.valueOf() === value.wantsEmail),
        phone: value.mobileNumber || null,
        wantsSms: (YesOrNo.YES.valueOf() === value.wantsSms)
      };
    }, {}) || { sponsorEmail: null, sponsorWantsEmail: false, phone: null, wantsSms: false };

    if (yesNoToBool(caseData.submissionOutOfTime)) {
      if (caseData.applicationOutOfTimeExplanation) {
        outOfTimeAppeal = { reason: caseData.applicationOutOfTimeExplanation };
      }
      if (caseData.applicationOutOfTimeDocument && caseData.applicationOutOfTimeDocument.document_filename) {

        const documentMapperId: string = this._documentManagementService.addToDocumentMapper(caseData.applicationOutOfTimeDocument.document_url, documentMap);
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
        const documentMapperId: string = this._documentManagementService.addToDocumentMapper(document.value.document.document_url, documentMap);

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

    if (caseData.correctedDecisionAndReasons) {
      updatedDecisionAndReasons = caseData.correctedDecisionAndReasons.map((ccdDecisionAndReasons: Collection<CcdDecisionAndReasons>): DecisionAndReasons => {
        let coverLetterDocument: Evidence;
        let documentAndReasonsDocument: Evidence;
        if (ccdDecisionAndReasons.value.coverLetterDocument && ccdDecisionAndReasons.value.coverLetterDocument.document_filename) {
          coverLetterDocument = this.mapSupportingDocumentToEvidence(ccdDecisionAndReasons.value.coverLetterDocument, documentMap);
        }
        if (ccdDecisionAndReasons.value.documentAndReasonsDocument && ccdDecisionAndReasons.value.documentAndReasonsDocument.document_filename) {
          documentAndReasonsDocument = this.mapSupportingDocumentToEvidence(ccdDecisionAndReasons.value.documentAndReasonsDocument, documentMap);
        }

        return {
          id: ccdDecisionAndReasons.id,
          ...ccdDecisionAndReasons.value,
          coverLetterDocument: coverLetterDocument,
          documentAndReasonsDocument: documentAndReasonsDocument
        };
      });
    }

    if (caseData.remittalDocuments) {
      remittalDocuments = caseData.remittalDocuments.map((ccdRemittalDetails: Collection<CcdRemittalDetails>): RemittalDetails => {
        let decisionDocument: Evidence;
        let otherRemittalDocs: Evidence[];
        if (ccdRemittalDetails.value.decisionDocument && ccdRemittalDetails.value.decisionDocument.document) {
          decisionDocument = this.mapSupportingDocumentToEvidence(ccdRemittalDetails.value.decisionDocument.document, documentMap);
        }
        if (ccdRemittalDetails.value.otherRemittalDocs) {
          otherRemittalDocs = this.mapDocsWithMetadataToEvidenceArray(ccdRemittalDetails.value.otherRemittalDocs, documentMap);
        }

        return {
          id: ccdRemittalDetails.id,
          ...ccdRemittalDetails.value,
          decisionDocument: decisionDocument,
          otherRemittalDocs: otherRemittalDocs
        };
      });
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
      const isInterpreterServicesNeeded: boolean = yesNoToBool(caseData.isInterpreterServicesNeeded);
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

      const multimediaEvidence: boolean = yesNoToBool(caseData.multimediaEvidence);
      let bringOwnMultimediaEquipment: boolean = null;
      let bringOwnMultimediaEquipmentReason: string = null;
      const singleSexAppointment: boolean = yesNoToBool(caseData.singleSexCourt);
      let singleSexTypeAppointment: 'All female' | 'All male' = null;
      let singleSexAppointmentReason: string = null;
      const privateAppointment: boolean = yesNoToBool(caseData.inCameraCourt);
      let privateAppointmentReason: string = null;
      const healthConditions: boolean = yesNoToBool(caseData.physicalOrMentalHealthIssues);
      let healthConditionsReason: string = null;
      const pastExperiences: boolean = yesNoToBool(caseData.pastExperiences);
      let pastExperiencesReason: string = null;
      const anythingElse: boolean = yesNoToBool(caseData.additionalRequests);
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
    if (caseData.isEvidenceFromOutsideUkInCountry) {
      hearingRequirements.witnessesOutsideUK = yesNoToBool(caseData.isEvidenceFromOutsideUkInCountry);
    }
    if (caseData.witnessDetails && caseData.witnessDetails.length) {
      hearingRequirements.witnessNames = caseData.witnessDetails.map(detail => {
        return {
          witnessPartyId: detail.value.witnessPartyId,
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

    if (caseData.isAnyWitnessInterpreterRequired) {
      hearingRequirements.isAnyWitnessInterpreterRequired = yesNoToBool(caseData.isAnyWitnessInterpreterRequired);
    }

    for (let index = 0; index < 10; index++) {
      const witnessString = 'witness' + (index + 1);
      const witnessObj = caseData[witnessString] as WitnessDetails;
      if (witnessObj) {
        hearingRequirements[witnessString] = {
          witnessPartyId: witnessObj.witnessPartyId,
          witnessName: witnessObj.witnessName,
          witnessFamilyName: witnessObj.witnessFamilyName
        };
      }

      const witnessListElementString = 'witnessListElement' + (index + 1);
      if (caseData[witnessListElementString]) {
        hearingRequirements[witnessListElementString] = caseData[witnessListElementString];
      }

      const witnessInterpreterLanguageCategoryString = 'witness' + (index + 1) + 'InterpreterLanguageCategory';
      if (caseData[witnessInterpreterLanguageCategoryString]) {
        hearingRequirements[witnessInterpreterLanguageCategoryString] = caseData[witnessInterpreterLanguageCategoryString];
      }

      const witnessInterpreterSpokenLanguageFieldString = 'witness' + (index + 1) + 'InterpreterSpokenLanguage';
      if (caseData[witnessInterpreterSpokenLanguageFieldString]) {
        hearingRequirements[witnessInterpreterSpokenLanguageFieldString] = caseData[witnessInterpreterSpokenLanguageFieldString];
      }

      const witnessInterpreterSignLanguageFieldString = 'witness' + (index + 1) + 'InterpreterSignLanguage';
      if (caseData[witnessInterpreterSignLanguageFieldString]) {
        hearingRequirements[witnessInterpreterSignLanguageFieldString] = caseData[witnessInterpreterSignLanguageFieldString];
      }
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

    if (caseData.ftpaR35AppellantDocument && caseData.ftpaR35AppellantDocument.document_filename) {
      reheardRule35AppellantDocument = this.mapSupportingDocumentToEvidence(caseData.ftpaR35AppellantDocument, documentMap);
    }

    if (caseData.ftpaR35RespondentDocument && caseData.ftpaR35RespondentDocument.document_filename) {
      reheardRule35RespondentDocument = this.mapSupportingDocumentToEvidence(caseData.ftpaR35RespondentDocument, documentMap);
    }

    if (caseData.ftpaApplicationRespondentDocument && caseData.ftpaApplicationRespondentDocument.document_filename) {
      ftpaApplicationRespondentDocument = this.mapSupportingDocumentToEvidence(caseData.ftpaApplicationRespondentDocument, documentMap);
    }

    if (caseData.ftpaApplicationAppellantDocument && caseData.ftpaApplicationAppellantDocument.document_filename) {
      ftpaApplicationAppellantDocument = this.mapSupportingDocumentToEvidence(caseData.ftpaApplicationAppellantDocument, documentMap);
    }

    if (caseData.rule32NoticeDocument && caseData.rule32NoticeDocument.document_filename) {
      rule32NoticeDocs = this.mapSupportingDocumentToEvidence(caseData.rule32NoticeDocument, documentMap);
    }

    if (caseData.previousRemissionDetails) {
      const previousRemissionDetailsData = caseData.previousRemissionDetails || [];
      previousRemissionDetails = previousRemissionDetailsData.map(remissionDetail => {
        let localAuthorityLetters = [];
        let asylumSupportDocument = null;
        let section17Document = null;
        let section20Document = null;
        let homeOfficeWaiverDocument = null;
        let remissionEcEvidenceDocuments = [];
        if ((remissionDetail.value.localAuthorityLetters?.length ?? 0) > 0) {
          localAuthorityLetters = this.mapDocsWithMetadataToEvidenceArray(remissionDetail.value.localAuthorityLetters, documentMap);
        }
        if (remissionDetail.value.asylumSupportDocument?.document_filename) {
          asylumSupportDocument = this.mapSupportingDocumentToEvidence(remissionDetail.value.asylumSupportDocument, documentMap);
        }
        if (remissionDetail.value.section17Document?.document_filename) {
          section17Document = this.mapSupportingDocumentToEvidence(remissionDetail.value.section17Document, documentMap);
        }
        if (remissionDetail.value.section20Document?.document_filename) {
          section20Document = this.mapSupportingDocumentToEvidence(remissionDetail.value.section20Document, documentMap);
        }
        if (remissionDetail.value.homeOfficeWaiverDocument?.document_filename) {
          homeOfficeWaiverDocument = this.mapSupportingDocumentToEvidence(remissionDetail.value.homeOfficeWaiverDocument, documentMap);
        }
        if ((remissionDetail.value.remissionEcEvidenceDocuments?.length ?? 0) > 0) {
          remissionEcEvidenceDocuments = this.mapSupportingDocumentsToEvidence(remissionDetail.value.remissionEcEvidenceDocuments, documentMap);
        }
        return {
          id: remissionDetail.id,
          feeAmount: remissionDetail.value.feeAmount,
          amountRemitted: remissionDetail.value.amountRemitted,
          amountLeftToPay: remissionDetail.value.amountLeftToPay,
          feeRemissionType: remissionDetail.value.feeRemissionType,
          remissionDecision: remissionDetail.value.remissionDecision,
          asylumSupportReference: remissionDetail.value.asylumSupportReference,
          remissionDecisionReason: remissionDetail.value.remissionDecisionReason,
          helpWithFeesReferenceNumber: remissionDetail.value.helpWithFeesReferenceNumber,
          helpWithFeesOption: remissionDetail.value.helpWithFeesOption,
          localAuthorityLetters: localAuthorityLetters,
          legalAidAccountNumber: remissionDetail.value.legalAidAccountNumber,
          exceptionalCircumstances: remissionDetail.value.exceptionalCircumstances,
          asylumSupportDocument: asylumSupportDocument,
          section17Document: section17Document,
          section20Document: section20Document,
          homeOfficeWaiverDocument: homeOfficeWaiverDocument,
          remissionEcEvidenceDocuments: remissionEcEvidenceDocuments
        } as RemissionDetails;
      });
    }

    const appeal: Appeal = {
      ccdCaseId: ccdCase.id,
      appealStatus: ccdCase.state,
      appealCreatedDate: ccdCase.created_date,
      appealLastModified: ccdCase.last_modified,
      appealReferenceNumber: caseData.appealReferenceNumber,
      ccdReferenceNumber: caseData.ccdReferenceNumberForDisplay,
      removeAppealFromOnlineReason: caseData.removeAppealFromOnlineReason,
      removeAppealFromOnlineDate: formatDate(caseData.removeAppealFromOnlineDate),
      isDecisionAllowed: caseData.isDecisionAllowed,
      updateTribunalDecisionList: caseData.updateTribunalDecisionList,
      updatedAppealDecision: caseData.updatedAppealDecision,
      typesOfUpdateTribunalDecision: caseData.typesOfUpdateTribunalDecision,
      updateTribunalDecisionAndReasonsFinalCheck: caseData.updateTribunalDecisionAndReasonsFinalCheck,
      rule32NoticeDocs: rule32NoticeDocs,
      appealOutOfCountry: caseData.appealOutOfCountry,
      utAppealReferenceNumber: caseData.utAppealReferenceNumber,
      nonStandardDirectionEnabled: true,
      ftpaR35AppellantDocument: reheardRule35AppellantDocument,
      ftpaR35RespondentDocument: reheardRule35RespondentDocument,
      ftpaApplicationRespondentDocument: ftpaApplicationRespondentDocument,
      ftpaApplicationAppellantDocument: ftpaApplicationAppellantDocument,
      readonlyApplicationEnabled: true,
      sourceOfRemittal: caseData.sourceOfRemittal,
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
        ...caseData.decisionHearingFeeOption && { decisionHearingFeeOption: caseData.decisionHearingFeeOption },
        remissionOption: caseData.remissionOption,
        feeRemissionType: caseData.feeRemissionType,
        remissionType: caseData.remissionType,
        remissionClaim: caseData.remissionClaim,
        asylumSupportRefNumber: caseData.asylumSupportRefNumber,
        asylumSupportReference: caseData.asylumSupportReference,
        legalAidAccountNumber: caseData.legalAidAccountNumber,
        exceptionalCircumstances: caseData.exceptionalCircumstances,
        ...caseData.asylumSupportDocument && { asylumSupportDocument: this.mapSupportingDocumentToEvidence(caseData.asylumSupportDocument, documentMap) },
        ...caseData.section17Document && { section17Document: this.mapSupportingDocumentToEvidence(caseData.section17Document, documentMap) },
        ...caseData.section20Document && { section20Document: this.mapSupportingDocumentToEvidence(caseData.section20Document, documentMap) },
        ...caseData.homeOfficeWaiverDocument && { homeOfficeWaiverDocument: this.mapSupportingDocumentToEvidence(caseData.homeOfficeWaiverDocument, documentMap) },
        ...caseData.remissionEcEvidenceDocuments && { remissionEcEvidenceDocuments: this.mapSupportingDocumentsToEvidence(caseData.remissionEcEvidenceDocuments, documentMap) },
        helpWithFeesOption: caseData.helpWithFeesOption,
        helpWithFeesRefNumber: caseData.helpWithFeesRefNumber,
        helpWithFeesReferenceNumber: caseData.helpWithFeesReferenceNumber,
        ...caseData.localAuthorityLetters && { localAuthorityLetters: this.mapDocsWithMetadataToEvidenceArray(caseData.localAuthorityLetters, documentMap) },
        feeSupportPersisted: caseData.feeSupportPersisted ? yesNoToBool(caseData.feeSupportPersisted) : undefined,
        refundRequested: caseData.refundRequested ? yesNoToBool(caseData.refundRequested) : undefined,
        remissionDecision: caseData.remissionDecision,
        lateRemissionOption: caseData.lateRemissionOption,
        lateAsylumSupportRefNumber: caseData.lateAsylumSupportRefNumber,
        lateHelpWithFeesOption: caseData.lateHelpWithFeesOption,
        lateHelpWithFeesRefNumber: caseData.lateHelpWithFeesRefNumber,
        ...caseData.lateLocalAuthorityLetters && { lateLocalAuthorityLetters: this.mapDocsWithMetadataToEvidenceArray(caseData.lateLocalAuthorityLetters, documentMap) },
        ...caseData.remissionRejectedDatePlus14days && { remissionRejectedDatePlus14days: caseData.remissionRejectedDatePlus14days },
        ...caseData.amountLeftToPay && { amountLeftToPay: caseData.amountLeftToPay },
        previousRemissionDetails: previousRemissionDetails,
        remissionDecisionReason: caseData.remissionDecisionReason,
        isLateRemissionRequest: caseData.isLateRemissionRequest ? yesNoToBool(caseData.isLateRemissionRequest) : undefined,
        feeUpdateTribunalAction: caseData.feeUpdateTribunalAction,
        feeUpdateReason: caseData.feeUpdateReason,
        manageFeeRefundedAmount: caseData.manageFeeRefundedAmount,
        manageFeeRequestedAmount: caseData.manageFeeRequestedAmount,
        paidAmount: caseData.paidAmount,
        refundConfirmationApplied: caseData.refundConfirmationApplied ? yesNoToBool(caseData.refundConfirmationApplied) : undefined,
        deportationOrderOptions: caseData.deportationOrderOptions
      },
      reasonsForAppeal: {
        applicationReason: caseData.reasonsForAppealDecision,
        evidences: reasonsForAppealDocumentUploads,
        uploadDate: caseData.reasonsForAppealDateUploaded
      },
      ...(_.has(caseData, 'directions')) && { directions },
      ...(_.has(caseData, 'correctedDecisionAndReasons')) && { updatedDecisionAndReasons },
      ...(_.has(caseData, 'remittalDocuments')) && { remittalDocuments },
      ...draftClarifyingQuestionsAnswers && { draftClarifyingQuestionsAnswers },
      ...caseData.clarifyingQuestionsAnswers && { clarifyingQuestionsAnswers: this.mapCcdClarifyingQuestionsToAppeal(caseData.clarifyingQuestionsAnswers, documentMap) },
      ...caseData.reheardHearingDocumentsCollection && { reheardHearingDocumentsCollection: this.mapCcdReheardHearingDocsToAppeal(caseData.reheardHearingDocumentsCollection, documentMap) },
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
      ...caseData.legalRepresentativeDocuments && { legalRepresentativeDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.legalRepresentativeDocuments, documentMap) },
      ...caseData.additionalEvidenceDocuments && { additionalEvidenceDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.additionalEvidenceDocuments, documentMap) },
      ...caseData.addendumEvidenceDocuments && { addendumEvidenceDocuments: this.mapAdditionalEvidenceToDocumentWithDescriptionArray(caseData.addendumEvidenceDocuments, documentMap) },
      ...caseData.tribunalDocuments && { tribunalDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.tribunalDocuments, documentMap) },
      ...caseData.hearingDocuments && { hearingDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.hearingDocuments, documentMap) },
      ...caseData.reheardHearingDocuments && { reheardHearingDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.reheardHearingDocuments, documentMap) },
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
      ...caseData.newFeeAmount && { newFeeAmount: caseData.newFeeAmount },
      ...caseData.previousFeeAmountGbp && { previousFeeAmountGbp: caseData.previousFeeAmountGbp },
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
      ...caseData.ftpaAppellantDecisionRemadeRule32Text && { ftpaAppellantDecisionRemadeRule32Text: caseData.ftpaAppellantDecisionRemadeRule32Text },
      ...caseData.ftpaRespondentDecisionRemadeRule32Text && { ftpaRespondentDecisionRemadeRule32Text: caseData.ftpaRespondentDecisionRemadeRule32Text },
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

  convertToCcdCaseData(appeal: Appeal, paymentsFlag = false, refundFlag = false) {
    let caseData = {
      journeyType: 'aip'
    } as CaseData;
    if (_.has(appeal, 'application')) {
      this.mapToCCDCaseAppealApplication(appeal, caseData, paymentsFlag, refundFlag);
    }

    if (_.has(appeal, 'reasonsForAppeal')) {
      this.mapToCCDCaseReasonsForAppeal(appeal, caseData);
    }

    if (_.has(appeal, 'cmaRequirements')) {
      this.mapToCCDCaseCmaRequirements(appeal, caseData);
    }

    if (_.has(appeal, 'hearingRequirements')) {
      this.mapToCCDCaseHearingRequirements(appeal, caseData);
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
      ...appeal.reheardHearingDocumentsCollection && {
        reheardHearingDocumentsCollection: this.mapAppealReheardHearingDocsToCcd(appeal.reheardHearingDocumentsCollection, appeal.documentMap)
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
      ...appeal.ftpaAppellantSubmissionOutOfTime && { ftpaAppellantSubmissionOutOfTime: appeal.ftpaAppellantSubmissionOutOfTime },
      ...appeal.application.remissionRejectedDatePlus14days && { remissionRejectedDatePlus14days: appeal.application.remissionRejectedDatePlus14days },
      ...appeal.application.amountLeftToPay && { amountLeftToPay: appeal.application.amountLeftToPay }
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
  };

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
  };

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
  };

  mapCaseDataDocumentsToAppealEvidences = (documents: Collection<DocumentWithMetaData>[], documentMap: DocumentMap[]): Evidence[] => {
    return documents.map(document => {
      const documentMapperId: string = this._documentManagementService.addToDocumentMapper(document.value.document.document_url, documentMap);
      return {
        id: document.id,
        fileId: documentMapperId,
        name: document.value.document.document_filename,
        ...document.value.dateUploaded && { dateUploaded: document.value.dateUploaded },
        ...document.value.description && { description: document.value.description }
      } as Evidence;
    });
  };

  private mapCcdClarifyingQuestionsToAppeal(clarifyingQuestions: ClarifyingQuestion<Collection<SupportingDocument>>[], documentMap: DocumentMap[]): ClarifyingQuestion<Evidence>[] {
    return clarifyingQuestions.map(answer => {
      let evidencesList: Evidence[] = [];
      if (answer.value.supportingEvidence) {
        evidencesList = this.mapSupportingDocumentsToEvidence(answer.value.supportingEvidence, documentMap);
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

  private mapCcdReheardHearingDocsToAppeal(reheardHearingDocumentsCollection: ReheardHearingDocs<Collection<DocumentWithMetaData>>[], documentMap: DocumentMap[]): ReheardHearingDocs<Evidence>[] {
    return reheardHearingDocumentsCollection.map(doc => {
      let evidencesList: Evidence[] = [];
      if (doc.value.reheardHearingDocs) {
        evidencesList = doc.value.reheardHearingDocs.map(e => this.mapDocWithMetadataToEvidence(e, documentMap));
      }
      return {
        id: doc.id,
        value: {
          reheardHearingDocs: evidencesList
        }
      };
    });
  }

  private mapAppealReheardHearingDocsToCcd(reheardHearingDocs: ReheardHearingDocs<Evidence>[], documentMap: DocumentMap[]): ReheardHearingDocs<Collection<DocumentWithMetaData>>[] {
    const ccdCQ = reheardHearingDocs.map((answer: ReheardHearingDocs<Evidence>): ReheardHearingDocs<Collection<DocumentWithMetaData>> => {
      let reheardHearingDocs: Collection<DocumentWithMetaData>[];
      if (answer.value.reheardHearingDocs) {
        reheardHearingDocs = answer.value.reheardHearingDocs.map(evidence => this.mapEvidenceToReheardHearingDocs(evidence, documentMap));
      }
      return {
        ...answer,
        value: {
          ...answer.value,
          ...answer.value.reheardHearingDocs && { reheardHearingDocs }
        }
      };
    });
    return ccdCQ;
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

  private mapSupportingDocumentToEvidence(evidence: SupportingDocument, documentMap: DocumentMap[]) {
    const documentMapperId: string = this._documentManagementService.addToDocumentMapper(evidence.document_url, documentMap);
    return {
      fileId: documentMapperId,
      name: evidence.document_filename
    };
  }

  private mapSupportingDocumentsToEvidence(evidence: Collection<SupportingDocument>[], documentMap: DocumentMap[]) {
    return evidence.map(doc => {
      const documentMapperId: string = this._documentManagementService.addToDocumentMapper(doc.value.document_url, documentMap);
      return {
        fileId: documentMapperId,
        name: doc.value.document_filename
      };
    });
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

  private mapEvidenceToReheardHearingDocs(evidence: Evidence, documentMap: DocumentMap[]): Collection<DocumentWithMetaData> {
    const documentUrl: string = documentIdToDocStoreUrl(evidence.fileId, documentMap);
    return {
      id: evidence.id,
      value: {
        tag: evidence.tag,
        document: {
          document_filename: evidence.name,
          document_url: documentUrl,
          document_binary_url: `${documentUrl}/binary`
        },
        description: evidence.description,
        dateUploaded: evidence.dateUploaded,
        dateTimeUploaded: evidence.dateTimeUploaded
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
    return docs.map((doc: Collection<DocumentWithMetaData>): Evidence => {
      return this.mapDocWithMetadataToEvidence(doc, documentMap);
    });
  };

  private mapDocWithMetadataToEvidence = (doc: Collection<DocumentWithMetaData>, documentMap: DocumentMap[]): Evidence => {
    const fileId = this._documentManagementService.addToDocumentMapper(doc.value.document.document_url, documentMap);
    return {
      fileId,
      name: doc.value.document.document_filename,
      ...doc.id && { id: doc.id },
      ...doc.value.tag && { tag: doc.value.tag },
      ...doc.value.suppliedBy && { suppliedBy: doc.value.suppliedBy },
      ...doc.value.description && { description: doc.value.description },
      ...doc.value.dateUploaded && { dateUploaded: doc.value.dateUploaded },
      ...doc.value.dateTimeUploaded && { dateTimeUploaded: doc.value.dateTimeUploaded }
    };
  };

  private mapAdditionalEvidenceToDocumentWithDescriptionArray = (docs: AdditionalEvidence[], documentMap: DocumentMap[]): Evidence[] => {
    const evidences = docs.map((doc: AdditionalEvidence): Evidence => {
      const fileId = this._documentManagementService.addToDocumentMapper(doc.value.document.document_url, documentMap);
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
  };

  private mapMakeApplicationsToSession = (makeAnApplications: Collection<Application<Collection<SupportingDocument>>>[], documentMap: DocumentMap[]): Collection<Application<Evidence>>[] => {
    return makeAnApplications.map((application) => {
      return {
        id: application.id,
        value: {
          ...application.value,
          ...application.value.evidence && { evidence: this.mapSupportingDocumentsToEvidence(application.value.evidence, documentMap) }
        }
      };
    });
  };

  private mapHearingOtherNeedsFromCCDCase(caseData, hearingRequirements: HearingRequirements) {

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

  private mapToCCDCaseDateLetterSent(appeal, caseData) {
    if (appeal.application.dateLetterSent && appeal.application.dateLetterSent.year) {
      caseData.homeOfficeDecisionDate = toIsoDate(appeal.application.dateLetterSent);
      caseData.submissionOutOfTime = appeal.application.isAppealLate ? YesOrNo.YES : YesOrNo.NO;
    }
  }

  private mapToCCDCaseDecisionLetterReceived(appeal, caseData) {
    if (appeal.application.decisionLetterReceivedDate && appeal.application.decisionLetterReceivedDate.year) {
      caseData.homeOfficeDecisionDate = toIsoDate(appeal.application.decisionLetterReceivedDate);
      caseData.submissionOutOfTime = appeal.application.isAppealLate ? YesOrNo.YES : YesOrNo.NO;
    }
  }

  private mapToCCDCaseApplicationOotDetails(appeal, caseData) {
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
  }

  private mapToCCDCasePesonalDetails(appeal, caseData) {
    if (appeal.application.personalDetails) {
      if (appeal.application.personalDetails.givenNames) {
        caseData.appellantGivenNames = appeal.application.personalDetails.givenNames;
      }
      if (appeal.application.personalDetails.familyName) {
        caseData.appellantFamilyName = appeal.application.personalDetails.familyName;
      }
      if (appeal.application.personalDetails.dob && appeal.application.personalDetails.dob.year) {
        caseData.appellantDateOfBirth = toIsoDate(appeal.application.personalDetails.dob);
      }
    }
  }

  private mapToCCDCaseClientLeaveUkDate(appeal, caseData) {
    if (appeal.application.dateClientLeaveUk && appeal.application.dateClientLeaveUk.year) {
      caseData.dateClientLeaveUk = toIsoDate(appeal.application.dateClientLeaveUk);
    }
  }

  private mapToCCDCaseDecisionLetterReceivedDate(appeal, caseData) {
    if (appeal.application.decisionLetterReceivedDate && appeal.application.decisionLetterReceivedDate.year) {
      caseData.decisionLetterReceivedDate = toIsoDate(appeal.application.decisionLetterReceivedDate);
    }
  }

  private mapToCCDCaseNationalities(appeal, caseData) {
    if (appeal.application.personalDetails && appeal.application.personalDetails.nationality) {
      caseData.appellantNationalities = [
        {
          value: {
            code: appeal.application.personalDetails.nationality
          }
        }
      ];
    }
  }

  private mapToCCDCasePersonalDetailsAddress(appeal, caseData) {
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
  }

  private mapToCCDLocalAuthorityLetters(appeal, caseData) {
    if (appeal.application.localAuthorityLetters) {
      const evidences: Evidence[] = appeal.application.localAuthorityLetters;

      caseData.localAuthorityLetters = evidences.map((evidence: Evidence) => {
        const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, appeal.documentMap);
        return {
          ...evidence.fileId && { id: evidence.fileId },
          value: {
            dateUploaded: evidence.dateUploaded,
            description: evidence.description,
            tag: 'additionalEvidence',
            document: {
              document_filename: evidence.name,
              document_url: documentLocationUrl,
              document_binary_url: `${documentLocationUrl}/binary`
            }
          }
        } as Collection<DocumentWithMetaData>;
      });
    }
  }

  private mapToCCDSupportingDocument(appeal, caseData, documentField: string) {
    if (appeal.application[documentField]) {
      const evidence: Evidence = appeal.application[documentField];

      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, appeal.documentMap);
      caseData[documentField] = {
        document_filename: evidence.name,
        document_url: documentLocationUrl,
        document_binary_url: `${documentLocationUrl}/binary`
      } as SupportingDocument;
    }
  }

  private mapToCCDSupportingDocuments(appeal, caseData, documentField: string) {
    if (appeal.application[documentField]) {
      const evidences: Evidence[] = appeal.application[documentField];

      caseData[documentField] = evidences.map((evidence: Evidence) => {
        const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, appeal.documentMap);
        return {
          ...evidence.fileId && { id: evidence.fileId },
          value: {
            document_filename: evidence.name,
            document_url: documentLocationUrl,
            document_binary_url: `${documentLocationUrl}/binary`
          }
        } as Collection<SupportingDocument>;
      });
    }
  }

  private mapToCCDLateLocalAuthorityLetters(appeal, caseData) {
    if (appeal.application.lateLocalAuthorityLetters) {
      const evidences: Evidence[] = appeal.application.lateLocalAuthorityLetters;

      caseData.lateLocalAuthorityLetters = evidences.map((evidence: Evidence) => {
        const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, appeal.documentMap);
        return {
          ...evidence.fileId && { id: evidence.fileId },
          value: {
            dateUploaded: evidence.dateUploaded || '',
            description: evidence.description,
            tag: 'additionalEvidence',
            document: {
              document_filename: evidence.name,
              document_url: documentLocationUrl,
              document_binary_url: `${documentLocationUrl}/binary`
            }
          }
        } as Collection<DocumentWithMetaData>;
      });
    }
  }

  private mapToCCDCaseContactDetails(appeal, caseData) {
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
  }

  private mapToCCDCaseSponsorAddress(appeal, caseData) {
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
  }

  private mapToCCDCaseSponsorDetails(appeal, caseData) {
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

  private mapToCCDCaseAppealApplication(appeal, caseData, paymentsFlag: boolean, refundFlag: boolean) {
    const { application } = appeal;

    this.assignSinglePropertyIfExists(application, 'homeOfficeRefNumber', caseData, 'homeOfficeReferenceNumber');
    caseData.appellantInUk = String(appeal.application.appellantInUk);
    this.assignSinglePropertyIfExistsWithYesNoToBoolFunction(application, 'outsideUkWhenApplicationMade', caseData, 'outsideUkWhenApplicationMade');
    caseData.gwfReferenceNumber = appeal.application.gwfReferenceNumber;

    this.mapToCCDCaseDateLetterSent(appeal, caseData);
    this.mapToCCDCaseDecisionLetterReceived(appeal, caseData);
    this.mapToCCDCaseApplicationOotDetails(appeal, caseData);
    this.mapToCCDCasePesonalDetails(appeal, caseData);
    this.mapToCCDCaseClientLeaveUkDate(appeal, caseData);
    this.mapToCCDCaseDecisionLetterReceivedDate(appeal, caseData);
    this.mapToCCDCaseNationalities(appeal, caseData);
    this.mapToCCDCasePersonalDetailsAddress(appeal, caseData);
    this.assignSinglePropertyIfExists(application, 'appellantOutOfCountryAddress', caseData, 'appellantOutOfCountryAddress');
    this.assignSinglePropertyIfExists(application, 'appealType', caseData, 'appealType');

    caseData.feeRemissionType = null;
    caseData.remissionOption = null;
    caseData.asylumSupportRefNumber = null;
    caseData.asylumSupportReference = null;
    caseData.asylumSupportDocument = null;
    caseData.section17Document = null;
    caseData.section20Document = null;
    caseData.homeOfficeWaiverDocument = null;
    caseData.remissionEcEvidenceDocuments = null;
    caseData.exceptionalCircumstances = null;
    caseData.legalAidAccountNumber = null;
    caseData.helpWithFeesOption = null;
    caseData.helpWithFeesRefNumber = null;
    caseData.helpWithFeesReferenceNumber = null;
    caseData.localAuthorityLetters = null;

    this.assignSinglePropertyIfExists(application, 'feeRemissionType', caseData, 'feeRemissionType');
    this.assignSinglePropertyIfExists(application, 'remissionType', caseData, 'remissionType');
    this.assignSinglePropertyIfExists(application, 'remissionClaim', caseData, 'remissionClaim');
    this.assignSinglePropertyIfExists(application, 'remissionOption', caseData, 'remissionOption');
    this.assignSinglePropertyIfExists(application, 'asylumSupportRefNumber', caseData, 'asylumSupportRefNumber');
    this.assignSinglePropertyIfExists(application, 'asylumSupportReference', caseData, 'asylumSupportReference');
    this.assignSinglePropertyIfExists(application, 'legalAidAccountNumber', caseData, 'legalAidAccountNumber');
    this.assignSinglePropertyIfExists(application, 'exceptionalCircumstances', caseData, 'exceptionalCircumstances');
    this.assignSinglePropertyIfExists(application, 'helpWithFeesOption', caseData, 'helpWithFeesOption');
    this.assignSinglePropertyIfExists(application, 'helpWithFeesRefNumber', caseData, 'helpWithFeesRefNumber');
    this.assignSinglePropertyIfExists(application, 'helpWithFeesReferenceNumber', caseData, 'helpWithFeesReferenceNumber');
    this.mapToCCDLocalAuthorityLetters(appeal, caseData);
    this.mapToCCDSupportingDocument(appeal, caseData, 'asylumSupportDocument');
    this.mapToCCDSupportingDocument(appeal, caseData, 'section17Document');
    this.mapToCCDSupportingDocument(appeal, caseData, 'section20Document');
    this.mapToCCDSupportingDocument(appeal, caseData, 'homeOfficeWaiverDocument');
    this.mapToCCDSupportingDocuments(appeal, caseData, 'remissionEcEvidenceDocuments');

    caseData.feeSupportPersisted = appeal.application.feeSupportPersisted ? YesOrNo.YES : YesOrNo.NO;

    if (paymentsFlag && refundFlag) {
      caseData.refundRequested = extendedBoolToYesNo(appeal.application.refundRequested);
      caseData.isLateRemissionRequest = extendedBoolToYesNo(appeal.application.isLateRemissionRequest);

      caseData.remissionDecision = null;
      caseData.lateRemissionOption = null;
      caseData.lateAsylumSupportRefNumber = null;
      caseData.lateHelpWithFeesOption = null;
      caseData.lateHelpWithFeesRefNumber = null;
      caseData.lateLocalAuthorityLetters = null;

      this.assignSinglePropertyIfExists(application, 'remissionDecision', caseData, 'remissionDecision');
      this.assignSinglePropertyIfExists(application, 'lateRemissionOption', caseData, 'lateRemissionOption');
      this.assignSinglePropertyIfExists(application, 'lateAsylumSupportRefNumber', caseData, 'lateAsylumSupportRefNumber');
      this.assignSinglePropertyIfExists(application, 'lateHelpWithFeesOption', caseData, 'lateHelpWithFeesOption');
      this.assignSinglePropertyIfExists(application, 'lateHelpWithFeesRefNumber', caseData, 'lateHelpWithFeesRefNumber');
      this.mapToCCDLateLocalAuthorityLetters(appeal, caseData);
      caseData.refundConfirmationApplied = extendedBoolToYesNo(appeal.application.refundConfirmationApplied);
    }

    if (appeal.application.contactDetails && (appeal.application.contactDetails.email || appeal.application.contactDetails.phone)) {
      this.mapToCCDCaseContactDetails(appeal, caseData);
      this.assignSinglePropertyIfExists(application, 'hasSponsor', caseData, 'hasSponsor');
      this.assignSinglePropertyIfExists(application, 'sponsorGivenNames', caseData, 'sponsorGivenNames');
      this.assignSinglePropertyIfExists(application, 'sponsorFamilyName', caseData, 'sponsorFamilyName');
      this.assignSinglePropertyIfExists(application, 'sponsorNameForDisplay', caseData, 'sponsorNameForDisplay');
      this.mapToCCDCaseSponsorAddress(appeal, caseData);

      if (appeal.application.sponsorContactDetails && (appeal.application.sponsorContactDetails.email || appeal.application.sponsorContactDetails.phone)) {
        this.mapToCCDCaseSponsorDetails(appeal, caseData);
      }
      this.assignSinglePropertyIfExists(application, 'sponsorAuthorisation', caseData, 'sponsorAuthorisation');
    }
    this.assignSinglePropertyIfExists(application, 'deportationOrderOptions', caseData, 'deportationOrderOptions');
  }

  private mapToCCDCaseReasonsForAppeal(appeal, caseData) {
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

  private mapAccessNeeds(appeal, caseData) {
    if (_.has(appeal, 'cmaRequirements.accessNeeds')) {
      const { accessNeeds } = appeal.cmaRequirements;
      this.mapAccessNeedsInterpreterServices(accessNeeds, caseData);
      this.mapAccessNeedsHearingRequirements(accessNeeds, caseData);
    }
  }

  private mapAccessNeedsInterpreterServices(accessNeeds, caseData) {
    if (_.has(accessNeeds, 'isInterpreterServicesNeeded')) {
      caseData.isInterpreterServicesNeeded = boolToYesNo(accessNeeds.isInterpreterServicesNeeded);
    }

    if (_.get(accessNeeds, 'isInterpreterServicesNeeded')) {
      if (_.has(accessNeeds, 'interpreterLanguage') && (_.has(accessNeeds.interpreterLanguage, 'language') || _.has(accessNeeds.interpreterLanguage, 'languageDialect'))) {
        caseData.interpreterLanguage = [{
          value: {
            language: accessNeeds.interpreterLanguage.language,
            languageDialect: accessNeeds.interpreterLanguage.languageDialect || null
          }
        }];
      }
    }
  }

  private mapAccessNeedsHearingRequirements(accessNeeds, caseData) {
    if (_.has(accessNeeds, 'isHearingLoopNeeded')) {
      caseData.isHearingLoopNeeded = boolToYesNo(accessNeeds.isHearingLoopNeeded);
    }

    if (_.has(accessNeeds, 'isHearingRoomNeeded')) {
      caseData.isHearingRoomNeeded = boolToYesNo(accessNeeds.isHearingRoomNeeded);
    }
  }

  private mapToCCDCaseHearingRequirements(appeal, caseData) {
    this.mapToCCDAttendance(appeal, caseData);
    this.mapToCCDWitnesses(appeal, caseData);
    this.mapToCCDInterpreterRequirements(appeal, caseData);
    this.mapToCCDWitnessInterpreterRequirements(appeal, caseData);
    this.mapToCCDCaseHearingRoomNeeded(appeal, caseData);
    this.mapToCCDCaseHearingLoopNeeded(appeal, caseData);
    this.mapToCCDOtherNeeds(appeal, caseData);
    this.mapToCCDDatesToAvoid(appeal, caseData);
    this.mapToCCDDecisionAllowed(appeal, caseData);
  }

  private mapOtherNeeds(appeal, caseData) {
    if (_.has(appeal, 'cmaRequirements.otherNeeds')) {
      const { otherNeeds } = appeal.cmaRequirements;
      this.mapOtherNeedsMultimediaEvidence(otherNeeds, caseData);
      this.mapOtherNeedsSingleSexAppointment(otherNeeds, caseData);
      this.mapOtherNeedsPrivateAppointment(otherNeeds, caseData);
      this.mapOtherNeedsHealthConditions(otherNeeds, caseData);
      this.mapOtherNeedsPastExperiences(otherNeeds, caseData);
      this.mapOtherNeedsAnythingElse(otherNeeds, caseData);
    }
  }

  private mapOtherNeedsMultimediaEvidence(otherNeeds, caseData) {
    if (_.has(otherNeeds, 'multimediaEvidence')) {
      caseData.multimediaEvidence = boolToYesNo(otherNeeds.multimediaEvidence);

      if (!otherNeeds.bringOwnMultimediaEquipment && !isEmpty(otherNeeds.bringOwnMultimediaEquipmentReason)) {
        caseData.multimediaEvidenceDescription = otherNeeds.bringOwnMultimediaEquipmentReason;
      }
    }
  }

  private mapOtherNeedsSingleSexAppointment(otherNeeds, caseData) {
    if (_.has(otherNeeds, 'singleSexAppointment')) {
      caseData.singleSexCourt = boolToYesNo(otherNeeds.singleSexAppointment);

      if (otherNeeds.singleSexAppointment && otherNeeds.singleSexTypeAppointment) {
        caseData.singleSexCourtType = otherNeeds.singleSexTypeAppointment;
        if (!isEmpty(otherNeeds.singleSexAppointmentReason)) {
          caseData.singleSexCourtTypeDescription = otherNeeds.singleSexAppointmentReason;
        }
      }
    }
  }

  private mapOtherNeedsPrivateAppointment(otherNeeds, caseData) {
    if (_.has(otherNeeds, 'privateAppointment')) {
      caseData.inCameraCourt = boolToYesNo(otherNeeds.privateAppointment);

      if (otherNeeds.privateAppointment && !isEmpty(otherNeeds.privateAppointmentReason)) {
        caseData.inCameraCourtDescription = otherNeeds.privateAppointmentReason;
      }
    }
  }

  private mapOtherNeedsHealthConditions(otherNeeds, caseData) {
    if (_.has(otherNeeds, 'healthConditions')) {
      caseData.physicalOrMentalHealthIssues = boolToYesNo(otherNeeds.healthConditions);

      if (otherNeeds.healthConditions && !isEmpty(otherNeeds.healthConditionsReason)) {
        caseData.physicalOrMentalHealthIssuesDescription = otherNeeds.healthConditionsReason;
      }
    }
  }

  private mapOtherNeedsPastExperiences(otherNeeds, caseData) {
    if (_.has(otherNeeds, 'pastExperiences')) {
      caseData.pastExperiences = boolToYesNo(otherNeeds.pastExperiences);

      if (otherNeeds.pastExperiences && !isEmpty(otherNeeds.pastExperiencesReason)) {
        caseData.pastExperiencesDescription = otherNeeds.pastExperiencesReason;
      }
    }
  }

  private mapOtherNeedsAnythingElse(otherNeeds, caseData) {
    if (_.has(otherNeeds, 'anythingElse')) {
      caseData.additionalRequests = boolToYesNo(otherNeeds.anythingElse);

      if (otherNeeds.anythingElse && !isEmpty(otherNeeds.anythingElseReason)) {
        caseData.additionalRequestsDescription = otherNeeds.anythingElseReason;
      }
    }
  }

  private mapCmaRequirementsDatesToAvoid(appeal, caseData) {
    if (_.has(appeal, 'cmaRequirements.datesToAvoid')) {
      const { datesToAvoid } = appeal.cmaRequirements;

      if (_.has(datesToAvoid, 'isDateCannotAttend')) {
        caseData.datesToAvoidYesNo = boolToYesNo(datesToAvoid.isDateCannotAttend);

        if (datesToAvoid.isDateCannotAttend && datesToAvoid.dates && datesToAvoid.dates.length) {
          caseData.datesToAvoid = datesToAvoid.dates.map(date => ({
            value: {
              dateToAvoid: toIsoDate(date.date),
              dateToAvoidReason: date.reason
            } as DateToAvoid
          } as Collection<DateToAvoid>));
        }
      }
    }
  }

  private mapToCCDCaseCmaRequirements(appeal, caseData) {
    this.mapAccessNeeds(appeal, caseData);
    this.mapOtherNeeds(appeal, caseData);
    this.mapCmaRequirementsDatesToAvoid(appeal, caseData);
  }

  private mapToCCDAttendance(appeal, caseData) {
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
  }

  private mapToCCDWitnesses(appeal, caseData) {
    if (_.has(appeal.hearingRequirements, 'witnessNames')) {
      caseData.witnessDetails = appeal.hearingRequirements.witnessNames.map(name => {
        return {
          value: {
            witnessPartyId: name.witnessPartyId,
            witnessName: name.witnessGivenNames,
            witnessFamilyName: name.witnessFamilyName
          } as WitnessDetails
        } as Collection<WitnessDetails>;
      });
    }
  }

  private mapToCCDInterpreterRequirements(appeal, caseData) {
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
  }

  private mapToCCDWitnessInterpreterRequirements(appeal, caseData) {
    if (_.has(appeal.hearingRequirements, 'isAnyWitnessInterpreterRequired')) {
      caseData.isAnyWitnessInterpreterRequired = boolToYesNo(appeal.hearingRequirements.isAnyWitnessInterpreterRequired);

      for (let index = 0; index < 10; index++) {
        if (_.has(appeal.hearingRequirements, 'witnessNames')) {
          const witnessString = 'witness' + (index + 1);
          const witnessObj: WitnessName = appeal.hearingRequirements.witnessNames[index];
          caseData[witnessString] = witnessObj ? {
            witnessPartyId: witnessObj.witnessPartyId,
            witnessName: witnessObj.witnessGivenNames,
            witnessFamilyName: witnessObj.witnessFamilyName
          } : null;
        }
        this.assignWitnessPropertiesToCCDCaseData(index, appeal, caseData);
      }
    }
  }

  private assignWitnessPropertiesToCCDCaseData(index, appeal, caseData) {
    const witnessListElementString = 'witnessListElement' + (index + 1);
    if (_.has(appeal.hearingRequirements, witnessListElementString)) {
      caseData[witnessListElementString] = appeal.hearingRequirements[witnessListElementString];
    }

    const witnessInterpreterLanguageCategoryString = 'witness' + (index + 1) + 'InterpreterLanguageCategory';
    if (_.has(appeal.hearingRequirements, witnessInterpreterLanguageCategoryString)) {
      caseData[witnessInterpreterLanguageCategoryString] = appeal.hearingRequirements[witnessInterpreterLanguageCategoryString];
    }

    const witnessInterpreterSpokenLanguageFieldString = 'witness' + (index + 1) + 'InterpreterSignLanguage';
    if (_.has(appeal.hearingRequirements, witnessInterpreterSpokenLanguageFieldString)) {
      caseData[witnessInterpreterSpokenLanguageFieldString] = appeal.hearingRequirements[witnessInterpreterSpokenLanguageFieldString];
    }

    const witnessInterpreterSignLanguageFieldString = 'witness' + (index + 1) + 'InterpreterSpokenLanguage';
    if (_.has(appeal.hearingRequirements, witnessInterpreterSignLanguageFieldString)) {
      caseData[witnessInterpreterSignLanguageFieldString] = appeal.hearingRequirements[witnessInterpreterSignLanguageFieldString];
    }
  }

  private mapToCCDCaseHearingRoomNeeded(appeal, caseData) {
    caseData.isHearingRoomNeeded = null;
    if (_.has(appeal.hearingRequirements, 'isHearingRoomNeeded')) {
      if (appeal.hearingRequirements.isHearingRoomNeeded != null) {
        caseData.isHearingRoomNeeded = boolToYesNo(appeal.hearingRequirements.isHearingRoomNeeded);
      }
    }
  }

  private mapToCCDCaseHearingLoopNeeded(appeal, caseData) {
    caseData.isHearingLoopNeeded = null;
    if (_.has(appeal.hearingRequirements, 'isHearingLoopNeeded')) {
      if (appeal.hearingRequirements.isHearingLoopNeeded != null) {
        caseData.isHearingLoopNeeded = boolToYesNo(appeal.hearingRequirements.isHearingLoopNeeded);
      }
    }
  }

  private mapToCCDOtherNeeds(appeal, caseData) {
    if (_.has(appeal, 'hearingRequirements.otherNeeds')) {
      this.mapToCCDCaseHearingRequirementsOtherNeeds(appeal, caseData);
    }
  }

  private mapToCCDDatesToAvoid(appeal, caseData) {
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
  }

  private mapToCCDDecisionAllowed(appeal, caseData) {
    if (_.has(appeal, 'isDecisionAllowed')) {
      caseData.isDecisionAllowed = appeal.isDecisionAllowed;
    }
  }

  private assignSinglePropertyIfExists(source, sourceKey, target, targetKey) {
    if (source[sourceKey]) {
      target[targetKey] = source[sourceKey];
    }
  }

  private assignSinglePropertyIfExistsWithYesNoToBoolFunction(source, sourceKey, target, targetKey) {
    if (source[sourceKey]) {
      target[targetKey] = yesNoToBool(source[sourceKey]) ? YesOrNo.YES : YesOrNo.NO;
    }
  }
}
