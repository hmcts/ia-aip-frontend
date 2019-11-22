import { Request } from 'express';
import { CcdService } from './ccd-service';
import { SecurityHeaders } from './getHeaders';
import IdamService from './idam-service';
import S2SService from './s2s-service';

export default class UpdateAppealService {
  private ccdService;
  private idamService;
  private s2sService;

  constructor(ccdService: CcdService, idamService: IdamService, s2sService: S2SService) {
    this.ccdService = ccdService;
    this.idamService = idamService;
    this.s2sService = s2sService;
  }

  async loadAppeal(req: Request) {
    const securityHeaders: SecurityHeaders = await this.getSecurityHeaders(req);
    const ccdCase = await this.ccdService.loadOrCreateCase(req.idam.userDetails.id, securityHeaders);
    req.session.ccdCaseId = ccdCase.id;

    const dateLetterSent = this.getDate(ccdCase.case_data.homeOfficeDecisionDate);
    const dateOfBirth = this.getDate(ccdCase.case_data.appellantDateOfBirth);

    req.session.appeal = {
      application: {
        homeOfficeRefNumber: ccdCase.case_data.homeOfficeReferenceNumber,
        appealType: null,
        contactDetails: {
          email: null,
          phone: null
        },
        dateLetterSent,
        isAppealLate: null,
        lateAppeal: null,
        personalDetails: {
          givenNames: ccdCase.case_data.appellantGivenNames,
          familyName: ccdCase.case_data.appellantFamilyName,
          dob: dateOfBirth,
          nationality: null
        }
      },
      caseBuilding: {},
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

  async updateAppeal(req: Request) {
    const securityHeaders: SecurityHeaders = await this.getSecurityHeaders(req);

    const currentUserId = req.idam.userDetails.id;
    const caseData = this.convertToCcdCaseData(req.session.appeal.application);
    const updatedCcdCase = {
      id: req.session.ccdCaseId,
      case_data: caseData
    };

    await this.ccdService.updateCase(currentUserId, updatedCcdCase, securityHeaders);
  }

  convertToCcdCaseData(application: AppealApplication) {
    const caseData = {
      journeyType: 'aip'
    } as any;

    if (application.homeOfficeRefNumber) {
      caseData.homeOfficeReferenceNumber = application.homeOfficeRefNumber;
    }
    if (application.dateLetterSent && application.dateLetterSent.year) {
      caseData.homeOfficeDecisionDate = this.toIsoDate(application.dateLetterSent);
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

    return caseData;
  }

  private toIsoDate(appealDate: AppealDate) {
    const appealDateString = new Date(`${appealDate.year}-${appealDate.month}-${appealDate.day}`);
    const dateLetterSentIso = appealDateString.toISOString().split('T')[0];
    return dateLetterSentIso;
  }

  private async getSecurityHeaders(req: Request): Promise<SecurityHeaders> {
    const userToken = this.idamService.getUserToken(req);
    const serviceToken = await this.s2sService.getServiceToken();

    return { userToken, serviceToken };
  }
}
