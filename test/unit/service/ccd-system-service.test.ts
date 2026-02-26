import axios from 'axios';
import CcdSystemService, {
  getJoinAppealPipValidationSuccess,
  getPipValidationSuccess, PipValidation,
  validateAccessCode,
  validateJoinAppealAccessCode,
  validateJoinAppealAccessCodeExists,
  validateJoinAppealAccessCodeExpiryDate,
  validateJoinAppealAccessCodeUsed
} from '../../../app/service/ccd-system-service';
import S2SService from '../../../app/service/s2s-service';
import { SystemAuthenticationService } from '../../../app/service/system-authentication-service';
import { addDaysToDate } from '../../../app/utils/date-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('ccd-system-service', () => {
  const caseId = '1234123412341234';
  const accessCode = 'ABCD1234EFGH';
  const invalidCode = 'AAAABBBBCCCC';

  describe('validateAccessCode', () => {
    it('should return false if pin has expired', () => {
      const caseDetails = {
        appellantPinInPost: {
          expiryDate: addDaysToDate(-1)
        }
      };
      const response = validateAccessCode(caseDetails, null);
      expect(response).to.eq(false);
    });

    it('should return false if accessCode does not match', () => {
      const caseDetails = {
        appellantPinInPost: {
          pinUsed: 'No',
          accessCode: accessCode,
          expiryDate: addDaysToDate(+1)
        }
      };
      const response = validateAccessCode(caseDetails, invalidCode);
      expect(response).to.eq(false);
    });

    it('should return false if accessCode has been used before', () => {
      const caseDetails = {
        appellantPinInPost: {
          pinUsed: 'Yes',
          accessCode: accessCode,
          expiryDate: addDaysToDate(+1)
        }
      };
      const response = validateAccessCode(caseDetails, accessCode);
      expect(response).to.eq(false);
    });

    it('should return true if accessCode matches, has not expired or been used before', () => {
      const caseDetails = {
        appellantPinInPost: {
          pinUsed: 'No',
          accessCode: accessCode,
          expiryDate: addDaysToDate(+1)
        }
      };
      const response = validateAccessCode(caseDetails, accessCode);
      expect(response).to.eq(true);
    });
  });

  describe('getPipValidationSuccess', () => {
    it('should return case summary with accessValidated set to true', () => {
      const caseDetails = {
        appellantGivenNames: 'James',
        appellantFamilyName: 'Bond'
      };
      const response = getPipValidationSuccess(caseId, caseDetails as CaseData);
      expect(response).to.deep.equal({
        accessValidated: true,
        caseSummary: {
          name: 'James Bond',
          referenceNumber: caseId
        }
      });
    });
  });

  describe('pipValidation', () => {
    const serviceToken = 'service-token';
    const systemCaseworkerToken = 'user-token';
    const systemCaseworkerUUID = 'abc-123-efg';

    const failedResponse = {
      accessValidated: false
    };

    const successResponse = {
      accessValidated: true,
      caseSummary: {
        name: 'James Bond',
        referenceNumber: caseId
      }
    };

    let sandbox: sinon.SinonSandbox;
    let authenticationServiceStub;
    let s2sServiceStub;
    let axiosStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      authenticationServiceStub = {
        getCaseworkSystemToken: sandbox.stub().resolves(systemCaseworkerToken),
        getCaseworkSystemUUID: sandbox.stub().resolves(systemCaseworkerUUID)
      };
      s2sServiceStub = {
        getServiceToken: sandbox.stub().resolves(serviceToken)
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('pipValidation in time', () => {
      beforeEach(() => {
        axiosStub = sandbox.stub(axios, 'get').returns(Promise.resolve({
          data: {
            id: caseId,
            case_data: {
              appellantGivenNames: 'James',
              appellantFamilyName: 'Bond',
              appellantPinInPost: {
                pinUsed: 'No',
                accessCode: accessCode,
                expiryDate: addDaysToDate(+1)
              }
            }
          }
        }));
      });

      it('should return validation failed response', async () => {
        const response = await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).pipValidation(caseId, invalidCode);
        expect(response).to.deep.equal(failedResponse);
      });

      it('should return case summary', async () => {
        const response = await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).pipValidation(caseId, accessCode);
        expect(response).to.deep.equal(successResponse);
      });
    });

    describe('pipValidation in time', () => {
      beforeEach(() => {
        axiosStub = sandbox.stub(axios, 'get').returns(Promise.reject(new Error('Error')));
      });

      it('should return validation failed response when retrieving case details fails', async () => {
        const response = await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).pipValidation(caseId, invalidCode);
        expect(response).to.deep.equal(failedResponse);
      });
    });

    describe('pipValidation expired', () => {
      it('should return validation failed response when expired', async () => {
        axiosStub = sandbox.stub(axios, 'get').returns(Promise.resolve({
          data: {
            case_data: {
              appellantPinInPost: {
                pinUsed: 'No',
                accessCode: accessCode,
                expiryDate: addDaysToDate(-1)
              }
            }
          }
        }));
        const response = await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).pipValidation(caseId, invalidCode);
        expect(response).to.deep.equal(failedResponse);
      });
    });

    describe('givenAppellantAccess', () => {
      it('successful', async () => {
        const appellantId = 'appellant-uuid';
        axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve());
        await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).givenAppellantAccess(caseId, appellantId);
        expect(axiosStub).to.be.calledWith(sinon.match(/.+\/caseworkers\/abc-123-efg\/jurisdictions\/IA\/case-types\/Asylum\/cases\/1234123412341234\/users/),
          { id: appellantId },
          {
            headers: {
              Authorization: 'Bearer user-token',
              ServiceAuthorization: 'service-token',
              'content-type': 'application/json'
            }
          });
      });
    });
  });

  function alterDateByDays(date: Date, days: number): Date {
    const alteredDate = new Date(date);
    alteredDate.setDate(alteredDate.getDate() + days);
    return alteredDate;
  }

  describe('joinAppealPip ', () => {
    const todayDate = new Date();
    let pinInPost: PinInPost;
    let caseData: CaseData;
    beforeEach(() => {
      pinInPost = {
        expiryDate: alterDateByDays(todayDate, 1),
        accessCode: accessCode,
        pinUsed: 'No'
      };
      caseData = {} as CaseData;
    });

    it('validateJoinAppealAccessCode functions should return true if has not expired, has not been used and is correct', async () => {
      expect(validateJoinAppealAccessCodeExpiryDate(pinInPost)).to.equal(true);
      expect(validateJoinAppealAccessCodeUsed(pinInPost)).to.equal(true);
      expect(validateJoinAppealAccessCode(pinInPost, accessCode)).to.equal(true);
    });

    it('validateJoinAppealAccessCodeExpiryDate should return false if pin has expired', async () => {
      pinInPost.expiryDate = alterDateByDays(todayDate, -1);
      expect(validateJoinAppealAccessCodeExpiryDate(pinInPost)).to.equal(false);
    });

    it('validateJoinAppealAccessCodeUsed should return false if pin has been used', async () => {
      pinInPost.pinUsed = 'Yes';
      expect(validateJoinAppealAccessCodeUsed(pinInPost)).to.equal(false);
    });

    it('validateJoinAppealAccessCode should return false if pin is incorrect', async () => {
      expect(validateJoinAppealAccessCode(pinInPost, invalidCode)).to.equal(false);
    });

    it('validateJoinAppealAccessCodeExists should return false if joinAppealPin is undefined, null or empty', async () => {
      expect(validateJoinAppealAccessCodeExists(caseData)).to.equal(false);
      caseData.joinAppealPin = undefined;
      expect(validateJoinAppealAccessCodeExists(caseData)).to.equal(false);
      caseData.joinAppealPin = null;
      expect(validateJoinAppealAccessCodeExists(caseData)).to.equal(false);
    });

    it('validateJoinAppealAccessCodeExists should return true if pin exists', async () => {
      caseData = { joinAppealPin: pinInPost } as CaseData;
      expect(validateJoinAppealAccessCodeExists(caseData)).to.equal(true);
    });

    it('getJoinAppealPipValidationSuccess should return case summary with accessValidated set to true', async () => {
      caseData = {
        appellantGivenNames: 'James',
        appellantFamilyName: 'Bond',
        appealReferenceNumber: 'some-appeal'
      } as CaseData;
      const response = getJoinAppealPipValidationSuccess(caseId, caseData);
      expect(response).to.deep.equal({
        accessValidated: true,
        caseSummary: {
          name: 'James Bond',
          appealReference: 'some-appeal',
          referenceNumber: caseId
        }
      });
    });

    describe('joinAppealPipValidation', () => {
      const serviceToken = 'service-token';
      const systemCaseworkerToken = 'user-token';
      const systemCaseworkerUUID = 'abc-123-efg';

      const failedResponse = {
        accessValidated: false
      };

      const successResponse = {
        accessValidated: true,
        caseSummary: {
          name: 'James Bond',
          referenceNumber: caseId
        }
      };

      let sandbox: sinon.SinonSandbox;
      let authenticationServiceStub;
      let s2sServiceStub;
      let getRequest: sinon.SinonStub;
      let ccdSystemService: CcdSystemService;
      beforeEach(() => {
        sandbox = sinon.createSandbox();
        authenticationServiceStub = {
          getCaseworkSystemToken: sandbox.stub().resolves(systemCaseworkerToken),
          getCaseworkSystemUUID: sandbox.stub().resolves(systemCaseworkerUUID)
        };
        s2sServiceStub = {
          getServiceToken: sandbox.stub().resolves(serviceToken)
        };
        ccdSystemService = new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('getCaseById should call with expected URL', async () => {
        getRequest = sandbox.stub(axios, 'get').resolves({});
        await ccdSystemService.getCaseById(caseId);
        const expectedUrl: string =
          `CCD_API_URL/caseworkers/${systemCaseworkerUUID}/jurisdictions/IA/case-types/Asylum/cases/${caseId}`;
        expect(getRequest.calledOnceWith(expectedUrl)).to.equal(true);
      });

      it('joinAppealPipValidation should return caseIdValid false if getCaseById fails', async () => {
        getRequest = sandbox.stub(axios, 'get').throws();
        const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(caseId, accessCode);
        expect(pipValidation.caseIdValid).to.equal(false);
      });

      it('joinAppealPipValidation should return doesPinExist false if getCaseById valid but no existing pin', async () => {
        getRequest = sandbox.stub(axios, 'get').resolves({data: { case_data: caseData }});
        const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(caseId, accessCode);
        expect(pipValidation.caseIdValid).to.equal(true);
        expect(pipValidation.doesPinExist).to.equal(false);
      });

      it('joinAppealPipValidation should return pinValid false if doesPinExist true but invalid pin', async () => {
        pinInPost.accessCode = invalidCode;
        caseData.joinAppealPin = pinInPost;
        getRequest = sandbox.stub(axios, 'get').resolves({data: { case_data: caseData }});
        const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(caseId, accessCode);
        expect(pipValidation.caseIdValid).to.equal(true);
        expect(pipValidation.doesPinExist).to.equal(true);
        expect(pipValidation.pinValid).to.equal(false);
      });

      it('joinAppealPipValidation should return codeUnused false if pinValid true but pin used', async () => {
        pinInPost.pinUsed = 'Yes';
        caseData.joinAppealPin = pinInPost;
        getRequest = sandbox.stub(axios, 'get').resolves({data: { case_data: caseData }});
        const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(caseId, accessCode);
        expect(pipValidation.caseIdValid).to.equal(true);
        expect(pipValidation.doesPinExist).to.equal(true);
        expect(pipValidation.pinValid).to.equal(true);
        expect(pipValidation.codeUnused).to.equal(false);
      });

      it('joinAppealPipValidation should return codeNotExpired false if codeUnused true but pin expired', async () => {
        pinInPost.expiryDate = alterDateByDays(todayDate, -1);
        caseData.joinAppealPin = pinInPost;
        getRequest = sandbox.stub(axios, 'get').resolves({data: { case_data: caseData }});
        const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(caseId, accessCode);
        expect(pipValidation.caseIdValid).to.equal(true);
        expect(pipValidation.doesPinExist).to.equal(true);
        expect(pipValidation.pinValid).to.equal(true);
        expect(pipValidation.codeUnused).to.equal(true);
        expect(pipValidation.codeNotExpired).to.equal(false);
      });

      it('joinAppealPipValidation should return success object if all validation passes', async () => {
        caseData = {
          appellantGivenNames: 'James',
          appellantFamilyName: 'Bond',
          appealReferenceNumber: 'some-appeal-ref',
          joinAppealPin: pinInPost
        } as CaseData;
        getRequest = sandbox.stub(axios, 'get').resolves({data: { case_data: caseData }});
        const pipValidation: PipValidation = await ccdSystemService.joinAppealPipValidation(caseId, accessCode);
        expect(pipValidation).to.deep.equal({
          accessValidated: true,
          caseSummary: {
            name: 'James Bond',
            appealReference: 'some-appeal-ref',
            referenceNumber: caseId
          }
        });
      });
    });
  });
});
