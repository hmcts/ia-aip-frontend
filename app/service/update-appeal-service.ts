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
    const ccdCase = await this.ccdService.loadOrCreateCase(req.idam.userDetails.id, securityHeaders);
    req.session.ccdCaseId = ccdCase.id;

    const caseData: CaseData = ccdCase.case_data;
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

    req.session.appeal = {
      application: {
        homeOfficeRefNumber: caseData.homeOfficeReferenceNumber,
        appealType: appealType,
        contactDetails: {
          ...contactDetails
        },
        dateLetterSent,
        isAppealLate: caseData.submissionOutOfTime ? this.yesNoToBool(caseData.submissionOutOfTime) : undefined,
        lateAppeal: {
          reason: caseData.applicationOutOfTimeExplanation
        },
        personalDetails: {
          givenNames: caseData.appellantGivenNames,
          familyName: caseData.appellantFamilyName,
          dob: dateOfBirth,
          nationality: caseData.appellantNationalities ? caseData.appellantNationalities[0].value.code : null,
          address: appellantAddress
        },
        addressLookup: {}
      },
      caseBuilding: {
        decision: null
      },
      hearingRequirements: {}
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

  yesNoToBool(YesOrNo: string): boolean {
    if (YesOrNo === 'Yes') return true;
    else if (YesOrNo === 'No') return false;
  }

  async submitEvent(event, req: Request) {
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);

    const currentUserId = req.idam.userDetails.id;
    const caseData = this.convertToCcdCaseData(req.session.appeal.application);
    const updatedCcdCase = {
      id: req.session.ccdCaseId,
      case_data: caseData
    };

    await this.ccdService.updateAppeal(event, currentUserId, updatedCcdCase, securityHeaders);
  }

  convertToCcdCaseData(application: AppealApplication) {
    const caseData = {
      journeyType: 'aip'
    } as CaseData;

    if (application.homeOfficeRefNumber) {
      caseData.homeOfficeReferenceNumber = application.homeOfficeRefNumber;
    }
    if (application.dateLetterSent && application.dateLetterSent.year) {
      caseData.homeOfficeDecisionDate = this.toIsoDate(application.dateLetterSent);
      caseData.submissionOutOfTime = application.isAppealLate ? YesOrNo.YES : YesOrNo.NO;
    }

    if (_.has(application.lateAppeal, 'reason')) {
      caseData.applicationOutOfTimeExplanation = application.lateAppeal.reason;
    }

    if (application.personalDetails && application.personalDetails.givenNames) {
      caseData.appellantGivenNames = application.personalDetails.givenNames;
    }
    if (application.personalDetails && application.personalDetails.familyName) {
      caseData.appellantFamilyName = application.personalDetails.familyName;
    }
    if (application.personalDetails.dob && application.personalDetails.dob.year) {
      caseData.appellantDateOfBirth = this.toIsoDate(application.personalDetails.dob);
    }
    if (application.personalDetails && application.personalDetails.nationality) {
      caseData.appellantNationalities = [
        {
          value: {
            code: application.personalDetails.nationality
          }
        }
      ];
    }
    if (_.has(application.personalDetails, 'address.line1')) {
      caseData.appellantAddress = {
        AddressLine1: application.personalDetails.address.line1,
        AddressLine2: application.personalDetails.address.line2,
        PostTown: application.personalDetails.address.city,
        County: application.personalDetails.address.county,
        PostCode: application.personalDetails.address.postcode,
        Country: 'United Kingdom'
      };
      caseData.appellantHasFixedAddress = 'Yes';
    }
    if (application.appealType) {
      caseData.appealType = application.appealType;
    }
    if (application.contactDetails && (application.contactDetails.email || application.contactDetails.phone)) {
      const subscription: Subscription = {
        subscriber: Subscriber.APPELLANT,
        wantsEmail: YesOrNo.NO,
        email: null,
        wantsSms: YesOrNo.NO,
        mobileNumber: null
      };

      if (application.contactDetails.wantsEmail === true && application.contactDetails.email) {
        subscription.wantsEmail = YesOrNo.YES;
        subscription.email = application.contactDetails.email;
      }
      if (application.contactDetails.wantsSms === true && application.contactDetails.phone) {
        subscription.wantsSms = YesOrNo.YES;
        subscription.mobileNumber = application.contactDetails.phone;
      }
      caseData.subscriptions = [ { id: 1, value: subscription } ];
    }

    return caseData;
  }

  private toIsoDate(appealDate: AppealDate) {
    const appealDateString = new Date(`${appealDate.year}-${appealDate.month}-${appealDate.day}`);
    const dateLetterSentIso = appealDateString.toISOString().split('T')[0];
    return dateLetterSentIso;
  }
}
