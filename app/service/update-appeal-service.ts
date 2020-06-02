import { Request } from 'express';
import * as _ from 'lodash';
import i18n from '../../locale/en.json';
import { toIsoDate } from '../utils/utils';
import { AuthenticationService, SecurityHeaders } from './authentication-service';
import { CcdService } from './ccd-service';
import { addToDocumentMapper, documentIdToDocStoreUrl } from './document-management-service';

enum Subscriber {
  APPELLANT = 'appellant',
  SUPPORTER = 'supporter'
}

enum YesOrNo {
  YES = 'Yes',
  NO = 'No'
}

export default class UpdateAppealService {
  private readonly _ccdService: CcdService;
  private readonly _authenticationService: AuthenticationService;
  private documentMap: DocumentMap[];

  constructor(ccdService: CcdService, authenticationService: AuthenticationService) {
    this._ccdService = ccdService;
    this._authenticationService = authenticationService;
    this.documentMap = [];
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

    const caseData: Partial<CaseData> = ccdCase.case_data;
    const dateLetterSent = this.getDate(caseData.homeOfficeDecisionDate);
    const dateOfBirth = this.getDate(caseData.appellantDateOfBirth);

    let timeExtensionEventsMap: TimeExtensionEventMap[] = [];

    const appellantAddress = caseData.appellantAddress ? {
      line1: caseData.appellantAddress.AddressLine1,
      line2: caseData.appellantAddress.AddressLine2,
      city: caseData.appellantAddress.PostTown,
      county: caseData.appellantAddress.County,
      postcode: caseData.appellantAddress.PostCode
    } : null;

    const appealType = caseData.appealType || null;
    const subscriptions = caseData.subscriptions || [];
    let outOfTimeAppeal: LateAppeal = null;
    let respondentDocuments: RespondentDocument[] = null;
    let timeExtensions: TimeExtension[] = [];
    let directions: Direction[] = null;
    let reasonsForAppealDocumentUploads: Evidence[] = null;
    let requestClarifyingQuestionsDirection;
    let isInterpreterServicesNeeded = caseData.isInterpreterServicesNeeded || '';
    let interpreterLanguage = caseData.interpreterLanguage || {};
    let isHearingRoomNeeded = caseData.isHearingRoomNeeded || '';
    let isHearingLoopNeeded = caseData.isHearingLoopNeeded || '';
    let draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[];
    let hasInflightTimeExtension = false;

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

    if (this.yesNoToBool(caseData.submissionOutOfTime)) {

      if (caseData.applicationOutOfTimeExplanation) {
        outOfTimeAppeal = { reason: caseData.applicationOutOfTimeExplanation };
      }
      if (caseData.applicationOutOfTimeDocument && caseData.applicationOutOfTimeDocument.document_filename) {

        const documentMapperId: string = addToDocumentMapper(caseData.applicationOutOfTimeDocument.document_url, this.documentMap);
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
        const documentMapperId: string = addToDocumentMapper(document.value.document.document_url, this.documentMap);

        reasonsForAppealDocumentUploads.push(
          {
            fileId: documentMapperId,
            name: document.value.document.document_filename,
            dateUploaded: this.getDate(document.value.dateUploaded),
            description: document.value.description
          }
        );
      });
    }

    if (caseData.respondentDocuments && ccdCase.state !== 'awaitingRespondentEvidence') {
      respondentDocuments = [];

      caseData.respondentDocuments.forEach(document => {
        const documentMapperId: string = addToDocumentMapper(document.value.document.document_url, this.documentMap);

        let evidence = {
          dateUploaded: document.value.dateUploaded,
          evidence: {
            fileId: documentMapperId,
            name: document.value.document.document_filename
          }
        };
        respondentDocuments.push(evidence);
      });
    }

    if (caseData.timeExtensions) {
      timeExtensions = [];

      caseData.timeExtensions.forEach(timeExtension => {
        if (timeExtension.value.status === 'submitted' && timeExtension.value.state === ccdCase.state) {
          hasInflightTimeExtension = true;
        }

        let timeExt: TimeExtension = {
          id: timeExtension.id,
          requestDate: timeExtension.value.requestDate,
          state: timeExtension.value.state,
          status: timeExtension.value.status,
          reason: timeExtension.value.reason,
          decision: timeExtension.value.decision,
          decisionReason: timeExtension.value.decisionReason
        };

        if (timeExtension.value.evidence) {

          let evidences = [];
          timeExtension.value.evidence.forEach(evidence => {
            const documentMapperId: string = addToDocumentMapper(evidence.value.document_url, this.documentMap);
            evidences.push({
              fileId: documentMapperId,
              name: evidence.value.document_filename
            });
          });
          timeExt.evidence = evidences;
        }
        timeExtensions.push(timeExt);

      });
    }

    if (caseData.directions) {
      directions = caseData.directions.map(d => {
        return {
          id: d.id,
          tag: d.value.tag,
          parties: d.value.parties,
          dateDue: d.value.dateDue,
          dateSent: d.value.dateSent
        } as Direction;
      });
      requestClarifyingQuestionsDirection = caseData.directions.find(direction => direction.value.tag === 'requestClarifyingQuestions');
    }

    if (requestClarifyingQuestionsDirection && ccdCase.state === 'awaitingClarifyingQuestionsAnswers') {
      if (caseData.draftClarifyingQuestionsAnswers) {
        draftClarifyingQuestionsAnswers = caseData.draftClarifyingQuestionsAnswers.map(answer => {
          let evidencesList: Evidence[] = [];
          if (answer.value.supportingEvidence) {
            evidencesList = answer.value.supportingEvidence.map(e => this.mapSupportingDocumentToEvidence(e));
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
      } else {
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
    }

    req.session.appeal = {
      appealStatus: ccdCase.state,
      appealCreatedDate: ccdCase.created_date,
      appealLastModified: ccdCase.last_modified,
      appealReferenceNumber: caseData.appealReferenceNumber,
      application: {
        homeOfficeRefNumber: caseData.homeOfficeReferenceNumber,
        appealType: appealType,
        contactDetails: {
          ...appellantContactDetails
        },
        dateLetterSent,
        isAppealLate: caseData.submissionOutOfTime ? this.yesNoToBool(caseData.submissionOutOfTime) : undefined,
        lateAppeal: outOfTimeAppeal || undefined,
        personalDetails: {
          givenNames: caseData.appellantGivenNames,
          familyName: caseData.appellantFamilyName,
          dob: dateOfBirth,
          nationality: caseData.appellantNationalities ? caseData.appellantNationalities[0].value.code : null,
          address: appellantAddress
        },
        addressLookup: {}
      },
      reasonsForAppeal: {
        applicationReason: caseData.reasonsForAppealDecision,
        evidences: reasonsForAppealDocumentUploads,
        uploadDate: caseData.reasonsForAppealDateUploaded
      },
      hearingRequirements: {},
      cmaRequirements: {},
      respondentDocuments: respondentDocuments,
      documentMap: [ ...this.documentMap ],
      directions: directions,
      timeExtensionEventsMap: timeExtensionEventsMap,
      timeExtensions: timeExtensions,
      draftClarifyingQuestionsAnswers,
      isHearingLoopNeeded,
      isHearingRoomNeeded,
      interpreterLanguage,
      isInterpreterServicesNeeded

    };

    req.session.appeal.askForMoreTime = {
      inFlight: hasInflightTimeExtension
    };
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

  yesNoToBool(answer: string): boolean {
    if (answer === 'Yes') {
      return true;
    } else if (answer === 'No') return false;
  }

  async submitEvent(event, req: Request): Promise<CcdCaseDetails> {
    const securityHeaders: SecurityHeaders = await this._authenticationService.getSecurityHeaders(req);

    const currentUserId = req.idam.userDetails.uid;
    const caseData = this.convertToCcdCaseData(req.session.appeal);

    const updatedCcdCase = {
      id: req.session.ccdCaseId,
      state: req.session.appeal.appealStatus,
      case_data: caseData
    };

    const updatedAppeal = await this._ccdService.updateAppeal(event, currentUserId, updatedCcdCase, securityHeaders);
    return updatedAppeal;
  }

  convertToCcdCaseData(appeal: Appeal) {
    const caseData = {
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
        }
        if (appeal.application.contactDetails.wantsSms === true && appeal.application.contactDetails.phone) {
          subscription.wantsSms = YesOrNo.YES;
          subscription.mobileNumber = appeal.application.contactDetails.phone;
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
              dateUploaded: toIsoDate(evidence.dateUploaded),
              description: evidence.description,
              document: {
                document_filename: evidence.name,
                document_url: documentLocationUrl,
                document_binary_url: `${documentLocationUrl}/binary`
              }
            } as DocumentWithMetaData
          };
        });
      }

      if (appeal.reasonsForAppeal.uploadDate) {
        caseData.reasonsForAppealDateUploaded = appeal.reasonsForAppeal.uploadDate;
      }
      if (_.has(appeal.cmaRequirements,'isHearingRoomNeeded')) {
        caseData.isHearingRoomNeeded = appeal.isHearingRoomNeeded;
      }
      if (_.has(appeal.cmaRequirements,'isHearingLoopNeeded')) {
        caseData.isHearingLoopNeeded = appeal.isHearingLoopNeeded;
      }
      if (_.has(appeal.cmaRequirements,'interpreterLanguage')) {
        caseData.interpreterLanguage = appeal.interpreterLanguage;
      }
      if (_.has(appeal.cmaRequirements,'isInterpreterServicesNeeded')) {
        caseData.isInterpreterServicesNeeded = appeal.isInterpreterServicesNeeded;
      }
    }

    const askForMoreTime = appeal.askForMoreTime;
    if (askForMoreTime && askForMoreTime.reason) {
      this.addCcdTimeExtension(askForMoreTime, appeal, caseData);
    }

    if (appeal.draftClarifyingQuestionsAnswers) {
      caseData.draftClarifyingQuestionsAnswers = this.mapAppealClarifyingQuestionsToCcd(appeal.draftClarifyingQuestionsAnswers, appeal.documentMap);
    }

    if (appeal.clarifyingQuestionsAnswers) {
      caseData.clarifyingQuestionsAnswers = this.mapAppealClarifyingQuestionsToCcd(appeal.clarifyingQuestionsAnswers, appeal.documentMap);
    }
    return caseData;
  }

  private mapAppealClarifyingQuestionsToCcd(clarifyingQuestions: ClarifyingQuestion<Evidence>[], documentMap: DocumentMap[]): ClarifyingQuestion<Collection<SupportingDocument>>[] {
    return clarifyingQuestions.map((answer: ClarifyingQuestion<Evidence>): ClarifyingQuestion<Collection<SupportingDocument>> => {
      let supportingEvidence: Collection<SupportingDocument>[];
      if (answer.value.supportingEvidence) {
        supportingEvidence = answer.value.supportingEvidence.map(evidence => this.mapEvidenceToSupportingDocument(evidence, documentMap));
      }
      return {
        ...answer,
        value: {
          ...answer.value,
          supportingEvidence
        }
      };
    });
  }

  private addCcdTimeExtension(askForMoreTime, appeal, caseData) {

    caseData.submitTimeExtensionReason = askForMoreTime.reason;

    if (askForMoreTime.reviewTimeExtensionRequired === YesOrNo.YES) {
      caseData.reviewTimeExtensionRequired = YesOrNo.YES;
    }
    if (askForMoreTime.evidence) {
      caseData.submitTimeExtensionEvidence = this.mapToTimeExtensionEvidenceCollection(askForMoreTime.evidence, appeal);
    }
  }

  private mapSupportingDocumentToEvidence(evidence: Collection<SupportingDocument>) {
    const documentMapperId: string = addToDocumentMapper(evidence.value.document_url, this.documentMap);
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
}
