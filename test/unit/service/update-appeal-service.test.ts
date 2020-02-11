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

    ccdServiceMock.expects('loadOrCreateCase')
      .withArgs(userId, { userToken, serviceToken })
      .resolves({
        id: caseId,
        case_data: {
          'appealType': 'protection',
          'journeyType': 'aip',
          'homeOfficeReferenceNumber': 'A1234567',
          'homeOfficeDecisionDate': '2019-01-02',
          'appellantFamilyName': 'Pedro',
          'appellantGivenNames': 'Jimenez',
          'appellantDateOfBirth': '1990-03-21',
          'appellantNationalities': [ { 'id': '0f583a62-e98a-4a76-abe2-130ad5547726', 'value': { 'code': 'AF' } } ],
          'appellantHasFixedAddress': 'Yes',
          'appellantAddress': {
            'County': '',
            'Country': 'United Kingdom',
            'PostCode': 'W1W 7RT',
            'PostTown': 'LONDON',
            'AddressLine1': '123 An Address',
            'AddressLine2': ''
          },
          'submissionOutOfTime': 'Yes',
          'applicationOutOfTimeExplanation': 'An Explanation on why this appeal was late',
          'applicationOutOfTimeDocument': {
            'document_url': 'http://dm-store:4506/documents/9f788e06-cc7d-4bf9-8d73-418b5fdcf891',
            'document_filename': '1580296112615-evidence-file.jpeg',
            'document_binary_url': 'http://dm-store:4506/documents/9f788e06-cc7d-4bf9-8d73-418b5fdcf891/binary'
          },
          'subscriptions': [ {
            'id': '7166f13d-1f99-4323-9459-b22a8325db9d',
            'value': {
              'subscriber': 'appellant',
              'email': 'email@example.net',
              'wantsSms': 'Yes',
              'mobileNumber': '07123456789',
              'wantsEmail': 'Yes'
            }
          } ]
        }
      });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('loadAppeal', () => {
    it('set case details', async () => {
      await updateAppealService.loadAppeal(req);
      expect(req.session.ccdCaseId).eq(caseId);
      expect(req.session.appeal.application.appealType).eq('protection');
      expect(req.session.appeal.application.homeOfficeRefNumber).eq('A1234567');
      expect(req.session.appeal.application.personalDetails.familyName).eq('Pedro');
      expect(req.session.appeal.application.personalDetails.givenNames).eq('Jimenez');
      expect(req.session.appeal.application.dateLetterSent.year).eq('2019');
      expect(req.session.appeal.application.dateLetterSent.month).eq('1');
      expect(req.session.appeal.application.dateLetterSent.day).eq('2');
      expect(req.session.appeal.application.personalDetails.dob.year).eq('1990');
      expect(req.session.appeal.application.personalDetails.dob.month).eq('3');
      expect(req.session.appeal.application.personalDetails.dob.day).eq('21');
      expect(req.session.appeal.application.personalDetails.nationality).eq('AF');
      expect(req.session.appeal.application.personalDetails.address.line1).eq('123 An Address');
      expect(req.session.appeal.application.personalDetails.address.city).eq('LONDON');
      expect(req.session.appeal.application.personalDetails.address.postcode).eq('W1W 7RT');
      expect(req.session.appeal.application.isAppealLate).eq(true);
      expect(req.session.appeal.application.lateAppeal.evidence.id).eq('1580296112615-evidence-file.jpeg');
      expect(req.session.appeal.application.lateAppeal.evidence.url).eq('http://dm-store:4506/documents/9f788e06-cc7d-4bf9-8d73-418b5fdcf891');
      expect(req.session.appeal.application.lateAppeal.evidence.name).eq('evidence-file.jpeg');
      expect(req.session.appeal.application.contactDetails.email).eq('email@example.net');
      expect(req.session.appeal.application.contactDetails.phone).eq('07123456789');
      expect(req.session.appeal.application.contactDetails.wantsEmail).eq(true);
      expect(req.session.appeal.application.contactDetails.wantsSms).eq(true);
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
    let expectedCaseData: CaseData;
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
            appealStatus: 'appealStarted',
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
        appellantHasFixedAddress: 'Yes',
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
          state: 'appealStarted',
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
          state: 'appealStarted',
          case_data: expectedCaseData
        },
        headers);
    });
  });
});
