import { Request } from 'express';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService, Events } from '../../../app/service/ccd-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon } from '../../utils/testUtils';

describe('update-appeal-service', () => {
  let sandbox: sinon.SinonSandbox;
  let ccdServiceMock: sinon.SinonMock;
  let req: Partial<Request>;
  let ccdService: Partial<CcdService>;
  let idamService: Partial<IdamService>;
  let s2sService: Partial<S2SService>;
  let authenticationService: Partial<AuthenticationService>;
  let updateAppealService;

  const userId = 'userId';
  const userToken = 'userToken';
  const serviceToken = 'serviceToken';
  const caseId = 'caseId';

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    idamService = new IdamService();
    s2sService = new S2SService();
    authenticationService = new AuthenticationService(idamService as IdamService, s2sService as S2SService);
    ccdService = new CcdService();

    ccdServiceMock = sandbox.mock(ccdService);

    sandbox.stub(idamService, 'getUserToken').returns(userToken);
    sandbox.stub(s2sService, 'getServiceToken').resolves(serviceToken);

    updateAppealService = new UpdateAppealService(ccdService as CcdService, authenticationService as AuthenticationService);
    req = {
      idam: {
        userDetails: {
          id: userId,
          forename: 'idamForename',
          surname: 'idamSurname'
        }
      },
      session: {}
    } as any;

  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('loadAppeal @only', () => {
    it('set case details', async () => {
      ccdServiceMock.expects('loadOrCreateCase')
      .withArgs(userId, { userToken, serviceToken })
      .resolves({
        id: caseId,
        case_data: {
          appealType: 'appealType',
          homeOfficeReferenceNumber: 'homeOfficeReferenceNumber',
          appellantGivenNames: 'appellantGivenNames',
          appellantFamilyName: 'appellantFamilyName',
          homeOfficeDecisionDate: '2019-01-02',
          appellantDateOfBirth: '1900-10-11'
        }
      });
      await updateAppealService.loadAppeal(req);
      expect(req.session.ccdCaseId).eq(caseId);
      expect(req.session.appeal.application.homeOfficeRefNumber).eq('homeOfficeReferenceNumber');
      expect(req.session.appeal.application.personalDetails.givenNames).eq('appellantGivenNames');
      expect(req.session.appeal.application.personalDetails.familyName).eq('appellantFamilyName');
      expect(req.session.appeal.application.dateLetterSent.year).eq('2019');
      expect(req.session.appeal.application.dateLetterSent.month).eq('1');
      expect(req.session.appeal.application.dateLetterSent.day).eq('2');
      expect(req.session.appeal.application.personalDetails.dob.year).eq('1900');
      expect(req.session.appeal.application.personalDetails.dob.month).eq('10');
      expect(req.session.appeal.application.personalDetails.dob.day).eq('11');
      expect(req.session.appeal.application.isAppealLate).eq(undefined);
    });

    it('set case details when appeal submission is NOT out of time', async () => {
      ccdServiceMock.expects('loadOrCreateCase')
      .withArgs(userId, { userToken, serviceToken })
      .resolves({
        id: caseId,
        case_data: {
          appealType: 'appealType',
          homeOfficeReferenceNumber: 'homeOfficeReferenceNumber',
          appellantGivenNames: 'appellantGivenNames',
          appellantFamilyName: 'appellantFamilyName',
          homeOfficeDecisionDate: '2019-01-02',
          appellantDateOfBirth: '1900-10-11',
          submissionOutOfTime: 'No'
        }
      });
      await updateAppealService.loadAppeal(req);
      expect(req.session.appeal.application.isAppealLate).eq(false);
      expect(req.session.appeal.application.lateAppeal).to.be.undefined;
    });

    it('set case details when appeal submission is OUT of time', async () => {
      ccdServiceMock.expects('loadOrCreateCase')
      .withArgs(userId, { userToken, serviceToken })
      .resolves({
        id: caseId,
        case_data: {
          appealType: 'appealType',
          homeOfficeReferenceNumber: 'homeOfficeReferenceNumber',
          appellantGivenNames: 'appellantGivenNames',
          appellantFamilyName: 'appellantFamilyName',
          homeOfficeDecisionDate: '2019-01-02',
          appellantDateOfBirth: '1900-10-11',
          submissionOutOfTime: 'Yes',
          applicationOutOfTimeExplanation: 'A reason',
          applicationOutOfTimeDocument: {
            document_filename: 'somefile.png',
            document_url: '#',
            document_binary_url: '#/binary'
          }
        }
      });
      await updateAppealService.loadAppeal(req);
      expect(req.session.appeal.application.isAppealLate).eq(true);
      expect(req.session.appeal.application.lateAppeal.reason).eq('A reason');
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
        emptyApplication.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-12-11',
          submissionOutOfTime: 'Yes'
        });
      });

      it('day and month leading 0', () => {
        emptyApplication.dateLetterSent = { year: '2019', month: '02', day: '01' };
        emptyApplication.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-02-01',
          submissionOutOfTime: 'Yes'
        });
      });

      it('day and month no leading 0', () => {
        emptyApplication.dateLetterSent = { year: '2019', month: '2', day: '3' };
        emptyApplication.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-02-03',
          submissionOutOfTime: 'Yes'
        });
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
    it('converts appealType', () => {
      emptyApplication.appealType = 'appealType';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', appealType: 'appealType' });
    });
    describe('converts contact details', () => {
      it('converts contactDetails for both email and phone', () => {
        emptyApplication.contactDetails.wantsEmail = true;
        emptyApplication.contactDetails.email = 'abc@example.net';
        emptyApplication.contactDetails.wantsSms = true;
        emptyApplication.contactDetails.phone = '07123456789';
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql(
          {
            journeyType: 'aip',
            subscriptions: [
              {
                id: 1,
                value: {
                  subscriber: 'appellant',
                  wantsEmail: 'Yes',
                  email: 'abc@example.net',
                  wantsSms: 'Yes',
                  mobileNumber: '07123456789'
                }
              }
            ]
          }
        );
      });

      it('converts contactDetails only email', () => {
        emptyApplication.contactDetails.wantsEmail = true;
        emptyApplication.contactDetails.email = 'abc@example.net';
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql(
          {
            journeyType: 'aip',
            subscriptions: [
              {
                id: 1,
                value: {
                  subscriber: 'appellant',
                  wantsEmail: 'Yes',
                  email: 'abc@example.net',
                  wantsSms: 'No',
                  mobileNumber: null
                }
              }
            ]
          }
        );
      });

      it('converts contactDetails only phone', () => {
        emptyApplication.contactDetails.wantsSms = true;
        emptyApplication.contactDetails.phone = '07123456789';
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql(
          {
            journeyType: 'aip',
            subscriptions: [
              {
                id: 1,
                value: {
                  subscriber: 'appellant',
                  wantsEmail: 'No',
                  email: null,
                  wantsSms: 'Yes',
                  mobileNumber: '07123456789'
                }
              }
            ]
          }
        );
      });
    });
  });

  describe('submitEvent', () => {
    let expectedCaseData: Partial<CaseData>;
    let ccdService2: Partial<CcdService>;
    let idamService2: IdamService;
    let s2sService2: Partial<S2SService>;
    let updateAppealServiceBis: UpdateAppealService;
    const headers = {
      userToken,
      serviceToken
    };

    beforeEach(() => {
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
              appealType: 'appealType',
              dateLetterSent: {
                year: 2019,
                month: 12,
                day: 11
              },
              isAppealLate: true,
              lateAppeal: {
                reason: 'a reason',
                evidence: {
                  id: '0000-somefile.png',
                  name: 'somefile.png',
                  url: '#'
                }
              },
              personalDetails: {
                givenNames: 'givenNames',
                familyName: 'familyName',
                dob: {
                  year: 1980,
                  month: 1,
                  day: 2
                },
                nationality: 'nationality',
                address: {
                  line1: '60 Beautiful Street',
                  line2: 'Flat 2',
                  city: 'London',
                  postcode: 'W1W 7RT',
                  county: 'London'
                }
              },
              contactDetails: {
                email: 'email@example.net',
                wantsEmail: true,
                phone: '07123456789',
                wantsSms: false
              },
              addressLookup: {}
            }
          } as Appeal,
          ccdCaseId: caseId
        } as Partial<Express.Session>
      } as Partial<Request>;

      ccdService2 = {
        updateAppeal: sandbox.stub()
      };
      idamService2 = {
        getUserToken: sandbox.stub().returns(userToken)
      };
      s2sService2 = {
        getServiceToken: sandbox.stub().resolves(serviceToken)
      };
      updateAppealServiceBis = new UpdateAppealService(ccdService2 as CcdService, authenticationService as AuthenticationService);
      expectedCaseData = {
        journeyType: 'aip',
        homeOfficeReferenceNumber: 'newRef',
        homeOfficeDecisionDate: '2019-12-11',
        submissionOutOfTime: 'Yes',
        applicationOutOfTimeExplanation: 'a reason',
        applicationOutOfTimeDocument: {
          document_filename: '0000-somefile.png',
          document_url: '#',
          document_binary_url: '#/binary'
        },
        appellantGivenNames: 'givenNames',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1980-01-02',
        appellantAddress: {
          AddressLine1: '60 Beautiful Street',
          AddressLine2: 'Flat 2',
          PostTown: 'London',
          County: 'London',
          PostCode: 'W1W 7RT',
          Country: 'United Kingdom'
        },
        appellantNationalities: [
          {
            value: {
              code: 'nationality'
            }
          }
        ],
        appealType: 'appealType',
        subscriptions: [
          {
            id: 1,
            value: {
              subscriber: 'appellant',
              wantsEmail: 'Yes',
              email: 'email@example.net',
              wantsSms: 'No',
              mobileNumber: null
            }
          }
        ]
      };
    });

    it('updates case with ccd', async () => {
      await updateAppealServiceBis.submitEvent(Events.EDIT_APPEAL, req as Request);
      expect(ccdService2.updateAppeal).to.have.been.called.calledWith(
        Events.EDIT_APPEAL,
        userId,
        {
          id: caseId,
          case_data: expectedCaseData
        },
        headers);
    });

    it('submits case with ccd', async () => {
      await updateAppealServiceBis.submitEvent(Events.SUBMIT_APPEAL, req as Request);
      expect(ccdService2.updateAppeal).to.have.been.called.calledWith(
        Events.SUBMIT_APPEAL,
        userId,
        {
          id: caseId,
          case_data: expectedCaseData
        },
        headers);
    });
  });
});
