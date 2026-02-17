import axios from 'axios';
import CcdSystemService, { getPipValidationSuccess, validateAccessCode } from '../../../app/service/ccd-system-service';
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
      expect(response).to.eql({
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
        expect(response).to.eql(failedResponse);
      });

      it('should return case summary', async () => {
        const response = await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).pipValidation(caseId, accessCode);
        expect(response).to.eql(successResponse);
      });
    });

    describe('pipValidation in time', () => {
      beforeEach(() => {
        axiosStub = sandbox.stub(axios, 'get').returns(Promise.reject({}));
      });

      it('should return validation failed response when retrieving case details fails', async () => {
        const response = await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).pipValidation(caseId, invalidCode);
        expect(response).to.eql(failedResponse);
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
        expect(response).to.eql(failedResponse);
      });
    });

    describe('givenAppellantAccess', () => {
      it('successful', async () => {
        const appellantId = 'appellant-uuid';
        axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve());
        await new CcdSystemService(authenticationServiceStub as SystemAuthenticationService, s2sServiceStub as S2SService).givenAppellantAccess(caseId, appellantId);
        expect(axiosStub).to.be.calledWith(sinon.match(/.+\/caseworkers\/abc-123-efg\/jurisdictions\/IA\/case-types\/Asylum\/cases\/1234123412341234\/users/),
          { id: appellantId },
          { headers: {
            Authorization: 'Bearer user-token',
            ServiceAuthorization: 'service-token',
            'content-type': 'application/json'
          }});
      });
    });
  });
});
