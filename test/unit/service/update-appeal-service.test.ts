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
            appellantFamilyName: 'appellantFamilyName',
            homeOfficeDecisionDate: '2019-01-02',
            appellantDateOfBirth: '1900-10-11'
          }
        });

      // @ts-ignore
      await updateAppealService.loadAppeal(req);
    });

    it('set ccd case id', () => {
      expect(req.session.ccdCaseId).eq(caseId);
    });

    it('set case details', () => {
      expect(req.session.appeal.application.homeOfficeRefNumber).eq('homeOfficeReferenceNumber');
      expect(req.session.appeal.application.personalDetails.givenNames).eq('appellantGivenNames');
      expect(req.session.appeal.application.personalDetails.familyName).eq('appellantFamilyName');
      expect(req.session.appeal.application.dateLetterSent.year).eq('2019');
      expect(req.session.appeal.application.dateLetterSent.month).eq('1');
      expect(req.session.appeal.application.dateLetterSent.day).eq('2');
      expect(req.session.appeal.application.personalDetails.dob.year).eq('1900');
      expect(req.session.appeal.application.personalDetails.dob.month).eq('10');
      expect(req.session.appeal.application.personalDetails.dob.day).eq('11');
    });
  });

  describe('convert to ccd case', () => {
    let emptyApplication;
    beforeEach(() => {
      emptyApplication = {
        homeOfficeRefNumber: null,
        appealType: null,
        contactDetails: {
          email: null,
          phone: null
        },
        dateLetterSent: {
          year: null,
          month: null,
          day: null
        },
        isAppealLate: false,
        lateAppeal: null,
        personalDetails: {
          givenNames: null,
          familyName: null,
          dob: {
            year: null,
            month: null,
            day: null
          },
          nationality: null
        }
      };
    });

    it('converts empty application', () => {
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip' });
    });

    it('converts home office reference number', () => {
      emptyApplication.homeOfficeRefNumber = 'ref';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', homeOfficeReferenceNumber: 'ref' });
    });

    describe('converts home office letter date', () => {
      it('full date', () => {
        emptyApplication.dateLetterSent = { year: '2019', month: '12', day: '11' };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', homeOfficeDecisionDate: '2019-12-11' });
      });

      it('day and month leading 0', () => {
        emptyApplication.dateLetterSent = { year: '2019', month: '02', day: '01' };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', homeOfficeDecisionDate: '2019-02-01' });
      });

      it('day and month no leading 0', () => {
        emptyApplication.dateLetterSent = { year: '2019', month: '2', day: '3' };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', homeOfficeDecisionDate: '2019-02-03' });
      });
    });

    it('converts given names', () => {
      emptyApplication.personalDetails.givenNames = 'givenNames';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', appellantGivenNames: 'givenNames' });
    });

    it('converts family name', () => {
      emptyApplication.personalDetails.familyName = 'familyName';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', appellantFamilyName: 'familyName' });
    });

    describe('converts date of birth', () => {
      it('full date', () => {
        emptyApplication.personalDetails = {
          dob: { year: '2019', month: '12', day: '11' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', appellantDateOfBirth: '2019-12-11' });
      });

      it('day and month leading 0', () => {
        emptyApplication.personalDetails = {
          dob: { year: '2019', month: '02', day: '01' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', appellantDateOfBirth: '2019-02-01' });
      });

      it('day and month no leading 0', () => {
        emptyApplication.personalDetails = {
          dob: { year: '2019', month: '2', day: '3' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', appellantDateOfBirth: '2019-02-03' });
      });
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
              homeOfficeRefNumber: 'newRef',
              dateLetterSent: {
                year: '2019',
                month: '12',
                day: '11'
              },
              personalDetails: {
                givenNames: 'givenNames',
                familyName: 'familyName',
                dob: {
                  year: '1980',
                  month: '01',
                  day: '02'
                }
              }
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
            homeOfficeDecisionDate: '2019-12-11',
            appellantFamilyName: 'familyName',
            appellantGivenNames: 'givenNames',
            appellantDateOfBirth: '1980-01-02',
            journeyType: 'aip'
          }
        },
        { userToken, serviceToken }
      );

      // @ts-ignore
      await updateAppealService.updateAppeal(req);
    });

    it('updates case with ccd', () => {
      ccdServiceMock.verify();
    });
  });
});
