import { Request } from 'express';
import * as _ from 'lodash';
import { AuthenticationService, SecurityHeaders } from './authentication-service';
import { CcdService } from './ccd-service';

enum Subscriber {
  APPELLANT = 'appellant',
  SUPPORTER = 'supporter'
}

enum YesOrNo {
  YES = 'Yes',
  NO = 'No'
}

export default class UpdateAppealService {
  private ccdService: CcdService;
  private authenticationService: AuthenticationService;

  constructor(ccdService: CcdService, authenticationService: AuthenticationService) {
    this.ccdService = ccdService;
    this.authenticationService = authenticationService;
  }

  async loadAppeal(req: Request) {
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const caseResponse = await this.ccdService.loadOrCreateCase(req.idam.userDetails.uid, securityHeaders);
    const ccdCase = caseResponse.case;
    const history = caseResponse.history;

    req.session.ccdCaseId = ccdCase.id;

    const caseData: Partial<CaseData> = ccdCase.case_data;
    const historyData: any = history;
    const dateLetterSent = this.getDate(caseData.homeOfficeDecisionDate);
    const dateOfBirth = this.getDate(caseData.appellantDateOfBirth);

    const appellantAddress = caseData.appellantAddress ? {
      line1: caseData.appellantAddress.AddressLine1,
      line2: caseData.appellantAddress.AddressLine2,
      city: caseData.appellantAddress.PostTown,
      county: caseData.appellantAddress.County,
      postcode: caseData.appellantAddress.PostCode
    } : null;

    const appealType = caseData.appealType || null;
    const subscriptions = caseData.subscriptions || [];
    let outOfTimeAppeal = null;
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
        outOfTimeAppeal = {
          ...outOfTimeAppeal,
          evidence: {
            id: caseData.applicationOutOfTimeDocument.document_filename,
            url: caseData.applicationOutOfTimeDocument.document_url,
            name: this.fileIdToName(caseData.applicationOutOfTimeDocument.document_filename)
          }
        };
      }
    }

    // TODO: Remove created and last modified date, used as a work around while the citizen cannot query the /events endpoint
    req.session.appeal = {
      appealStatus: ccdCase.state,
      appealCreatedDate: ccdCase.created_date,
      appealLastModified: ccdCase.last_modified,
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
        applicationReason: null
      },
      hearingRequirements: {},
      history: historyData
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

  fileIdToName(fileID: string): string {
    return fileID.substring(fileID.indexOf('-') + 1);
  }

  async submitEvent(event, req: Request): Promise<CcdCaseDetails> {
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);

    const currentUserId = req.idam.userDetails.uid;
    const caseData = this.convertToCcdCaseData(req.session.appeal);
    const updatedCcdCase = {
      id: req.session.ccdCaseId,
      state: req.session.appeal.appealStatus,
      case_data: caseData
    };

    const updatedAppeal = await this.ccdService.updateAppeal(event, currentUserId, updatedCcdCase, securityHeaders);
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
        caseData.applicationOutOfTimeDocument = {
          document_filename: appeal.application.lateAppeal.evidence.id,
          document_url: appeal.application.lateAppeal.evidence.url,
          document_binary_url: `${appeal.application.lateAppeal.evidence.url}/binary`
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
      // save text and evidence file
      if (appeal.reasonsForAppeal.applicationReason) {
        caseData.reasonsForAppealDecision = appeal.reasonsForAppeal.applicationReason;
      }
      if (appeal.reasonsForAppeal.evidences) {
        const evidences: Evidences = appeal.reasonsForAppeal.evidences;

        caseData.reasonsForAppealDocuments = Object.values(evidences).map((evidence) => {
          return {
            value: {
              document_filename: evidence.id,
              document_url: evidence.url,
              document_binary_url: `${evidence.url}/binary`
            } as SupportingDocument
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
