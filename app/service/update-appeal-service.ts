import { Request } from 'express';
import * as _ from 'lodash';
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
    const dateOfBirth = this.getDate(caseData.appellantDateOfBirth);
    const listCmaHearingCentre = caseData.listCaseHearingCentre || '';
    const listCmaHearingLength = caseData.listCaseHearingLength || '';
    const listCmaHearingDate = caseData.listCaseHearingDate || '';

    const appellantAddress = caseData.appellantAddress ? {
      line1: caseData.appellantAddress.AddressLine1,
      line2: caseData.appellantAddress.AddressLine2,
      city: caseData.appellantAddress.PostTown,
      county: caseData.appellantAddress.County,
      postcode: caseData.appellantAddress.PostCode
    } : null;

    const subscriptions = caseData.subscriptions || [];
    let outOfTimeAppeal: LateAppeal = null;
    // let respondentDocuments: RespondentDocument[] = null;
    let directions: Direction[] = null;
    let reasonsForAppealDocumentUploads: Evidence[] = null;
    let requestClarifyingQuestionsDirection;
    let cmaRequirements: CmaRequirements = {};
    let draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[];
    let clarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[];
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
      draftClarifyingQuestionsAnswers = caseData.draftClarifyingQuestionsAnswers.map((answer): ClarifyingQuestion<Evidence> => {
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
            supportingEvidence: evidencesList,
            dateResponded: answer.value.dateResponded
          }
        };
      });
    } else if (requestClarifyingQuestionsDirection && ccdCase.state === 'awaitingClarifyingQuestionsAnswers') {
      draftClarifyingQuestionsAnswers = [ ...requestClarifyingQuestionsDirection.value.clarifyingQuestions ].map((question) => {
        question.value.dateSent = requestClarifyingQuestionsDirection.value.dateSent;
        question.value.dueDate = requestClarifyingQuestionsDirection.value.dateDue;
        return question;
      });
      draftClarifyingQuestionsAnswers.push({
        value: {
          dateSent: requestClarifyingQuestionsDirection.value.dateSent,
          dueDate: requestClarifyingQuestionsDirection.value.dateDue,
          question: i18n.pages.clarifyingQuestionAnythingElseQuestion.question
        }
      });
    }

    if (caseData.clarifyingQuestionsAnswers) {
      clarifyingQuestionsAnswers = this.mapCcdClarifyingQuestionsToAppeal(caseData.clarifyingQuestionsAnswers, documentMap);
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

    const appeal: Appeal = {
      ccdCaseId: ccdCase.id,
      appealStatus: ccdCase.state,
      appealCreatedDate: ccdCase.created_date,
      appealLastModified: ccdCase.last_modified,
      appealReferenceNumber: caseData.appealReferenceNumber,
      removeAppealFromOnlineReason: caseData.removeAppealFromOnlineReason,
      removeAppealFromOnlineDate: formatDate(caseData.removeAppealFromOnlineDate),
      application: {
        homeOfficeRefNumber: caseData.homeOfficeReferenceNumber,
        appealType: caseData.appealType || null,
        contactDetails: {
          ...appellantContactDetails
        },
        dateLetterSent,
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
      ...clarifyingQuestionsAnswers && { clarifyingQuestionsAnswers },
      ...caseData.clarifyingQuestionsAnswers && { clarifyingQuestionsAnswers },
      cmaRequirements,
      askForMoreTime: {
        ...(_.has(caseData, 'submitTimeExtensionReason')) && { reason: caseData.submitTimeExtensionReason },
        inFlight: hasPendingTimeExtension
      },
      hearing: {
        hearingCentre: listCmaHearingCentre,
        time: listCmaHearingLength,
        date: listCmaHearingDate
      },
      ...caseData.respondentDocuments && { respondentDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.respondentDocuments, documentMap) },
      ...caseData.legalRepresentativeDocuments && { legalRepresentativeDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.legalRepresentativeDocuments, documentMap) },
      // leaving this in until we rebase with RIA-4650 & RIA-4707
      // ...caseData.additionalEvidenceDocuments && { additionalEvidenceDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.additionalEvidenceDocuments, documentMap) },
      ...caseData.tribunalDocuments && { tribunalDocuments: this.mapDocsWithMetadataToEvidenceArray(caseData.tribunalDocuments, documentMap) },
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
      hearingCentre: caseData.hearingCentre || null,
      documentMap
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
      if (appeal.application.dateLetterSent && appeal.application.dateLetterSent.year) {
        caseData.homeOfficeDecisionDate = toIsoDate(appeal.application.dateLetterSent);
        caseData.submissionOutOfTime = appeal.application.isAppealLate ? YesOrNo.YES : YesOrNo.NO;
      }

      if (appeal.application.isAppealLate) {
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
        caseData.subscriptions = [ { value: subscription } ];
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
            caseData.interpreterLanguage = [ {
              value: {
                language: accessNeeds.interpreterLanguage.language,
                languageDialect: accessNeeds.interpreterLanguage.languageDialect || null
              }
            } ];
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
      // leaving this in until we rebase with RIA-4650 & RIA-4707
      ...appeal.additionalEvidence && {
        additionalEvidence: this.mapAdditionalEvidenceDocumentsToDocumentsCaseData(appeal.additionalEvidence, appeal.documentMap)
      },
      ...appeal.makeAnApplicationTypes && { makeAnApplicationTypes: appeal.makeAnApplicationTypes },
      ...appeal.makeAnApplicationDetails && { makeAnApplicationDetails: appeal.makeAnApplicationDetails },
      ...appeal.makeAnApplicationEvidence && { makeAnApplicationEvidence: this.mapAppealEvidencesToDocumentsCaseData(appeal.makeAnApplicationEvidence, appeal.documentMap) }
    };
    return caseData;
  }

  mapAdditionalEvidenceDocumentsToDocumentsCaseData = (evidences: AdditionalEvidenceDocument[], documentMap: DocumentMap[]): Collection<Document>[] => {
    return evidences.map((evidence: AdditionalEvidenceDocument) => {
      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, documentMap);
      return {
        id: evidence.fileId,
        value: {
          description: 'additionalEvidenceDocument',
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
          supportingEvidence: evidencesList
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
}
