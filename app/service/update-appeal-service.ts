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

    req.session.appeal = {
      application: {
        homeOfficeRefNumber: ccdCase.case_data.homeOfficeReferenceNumber,
        appealType: null,
        contactDetails: null,
        dateLetterSent: null,
        isAppealLate: false,
        lateAppeal: null,
        personalDetails: {
          givenNames: ccdCase.case_data.appellantGivenNames,
          familyName: ccdCase.case_data.appellantFamilyName,
          dob: null,
          nationality: null
        }
      },
      caseBuilding: {},
      hearingRequirements: {}
    };
  }

  async updateAppeal(req: Request) {
    const securityHeaders: SecurityHeaders = await this.getSecurityHeaders(req);

    const currentUserId = req.idam.userDetails.id;
    const updatedCcdCase = {
      id : req.session.ccdCaseId,
      case_data: {
        homeOfficeReferenceNumber: req.session.appeal.application.homeOfficeRefNumber,
        journeyType: 'aip'
      }
    };

    await this.ccdService.updateCase(currentUserId, updatedCcdCase, securityHeaders);
  }

  private async getSecurityHeaders(req: Request): Promise<SecurityHeaders> {
    const userToken = this.idamService.getUserToken(req);
    const serviceToken = await this.s2sService.getServiceToken();

    return { userToken, serviceToken };
  }
}
