import { Request } from 'express';
import * as _ from 'lodash';
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

  constructor(ccdService: CcdService, authenticationService: AuthenticationService) {
    this._ccdService = ccdService;
    this._authenticationService = authenticationService;
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

    let documentMap: DocumentMap[] = [];

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
    let directions: Direction[] = null;
    let reasonsForAppealDocumentUploads: Evidence[] = null;

    const contactDetails = subscriptions.reduce((contactDetails, subscription) => {
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
            dateUploaded: this.getDate(document.value.dateUploaded),
            description: document.value.description
          }
        );
      });
    }

    if (caseData.respondentDocuments && ccdCase.state !== 'awaitingRespondentEvidence') {
      respondentDocuments = [];

      caseData.respondentDocuments.forEach(document => {
        const documentMapperId: string = addToDocumentMapper(document.value.document.document_url, documentMap);

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
    if (caseData.directions) {
      directions = caseData.directions.map(d => {
        return {
          tag: d.value.tag,
          parties: d.value.parties,
          dueDate: d.value.dateDue,
          dateSent: d.value.dateSent
        };
      });
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
          ...contactDetails
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
        evidences: reasonsForAppealDocumentUploads
      },
      hearingRequirements: {},
      respondentDocuments: respondentDocuments,
      documentMap: documentMap,
      directions: directions
    };
  }

  private getDate(ccdDate): AppealDate {
    if (ccdDate) {
      let dateLetterSent = {
        year: null,
        month: null,
        day: null
      };
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
        caseData.homeOfficeDecisionDate = this.toIsoDate(appeal.application.dateLetterSent);
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
        caseData.appellantDateOfBirth = this.toIsoDate(appeal.application.personalDetails.dob);
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
              dateUploaded: this.toIsoDate(evidence.dateUploaded),
              description: evidence.description,
              document: {
                document_filename: evidence.name,
                document_url: documentLocationUrl,
                document_binary_url: `${documentLocationUrl}/binary`
              }
            } as DocumentWithMetaData
          } as SupportingEvidenceCollection;
        });
      }
    }
    return caseData;
  }

  private toIsoDate(appealDate: AppealDate) {
    const appealDateString = new Date(`${appealDate.year}-${appealDate.month}-${appealDate.day}`);
    const dateLetterSentIso = appealDateString.toISOString().split('T')[0];
    return dateLetterSentIso;
  }
}
