import { CcdService } from '../../../app/service/ccd-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon } from '../../utils/testUtils';

describe('update-appeal-service', () => {
  const ccdService = new CcdService();
  const ccdServiceMock = sinon.mock(ccdService);
  const idamService = new IdamService();
  const getUserTokenStub = sinon.stub(idamService, 'getUserToken');
  const s2sService = new S2SService();
  const getServiceTokenStub = sinon.stub(s2sService, 'getServiceToken');
  const updateAppealService = new UpdateAppealService(ccdService, idamService, s2sService);
  let req;
  const userId = 'userId';
  const userToken = 'userToken';
  const serviceToken = 'serviceToken';
  const caseId = 'caseId';

  before(async () => {
    getUserTokenStub.returns(userToken);
    getServiceTokenStub.resolves(serviceToken);
  });

  describe('loadAppeal', () => {
    before(async () => {
      req = {
        idam: {
          userDetails: {
            id: userId
          }
        },
        session: {}
      };
      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          case_data: {
            homeOfficeReferenceNumber: 'homeOfficeReferenceNumber',
            appellantGivenNames: 'appellantGivenNames',
            appellantFamilyName: 'appellantFamilyName'
          }
        });

      // @ts-ignore
      await updateAppealService.loadAppeal(req);
    });

    it('set ccd case id', function () {
      expect(req.session.ccdCaseId).eq(caseId);
    });

    it('set case details', function () {
      expect(req.session.appeal.application.homeOfficeRefNumber).eq('homeOfficeReferenceNumber');
      expect(req.session.appeal.application.personalDetails.firstName).eq('appellantGivenNames');
      expect(req.session.appeal.application.personalDetails.lastName).eq('appellantFamilyName');
    });
  });

  describe('updateAppeal', () => {

    before(async () => {
      req = {
        idam: {
          userDetails: {
            id: userId
          }
        },
        session: {
          appeal: {
            application: {
              homeOfficeRefNumber: 'newRef'
            }
          },
          ccdCaseId: caseId
        }
      };

      ccdServiceMock.expects('updateCase').withArgs(
        userId,
        {
          id: caseId,
          case_data: {
            homeOfficeReferenceNumber: 'newRef',
            journeyType: 'aip'
          }
        },
        { userToken, serviceToken }
      );

      // @ts-ignore
      await updateAppealService.updateAppeal(req);
    });

    it('updates case with ccd', function () {
      ccdServiceMock.verify();
    });
  });
});
