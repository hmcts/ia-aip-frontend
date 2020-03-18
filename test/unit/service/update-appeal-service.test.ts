import { Request } from 'express';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService, Events } from '../../../app/service/ccd-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon, validateUuid } from '../../utils/testUtils';

describe('update-appeal-service', () => {
  let sandbox: sinon.SinonSandbox;
  let ccdServiceMock: sinon.SinonMock;
  let req: Partial<Request>;
  let ccdService: Partial<CcdService>;
  let idamService: Partial<IdamService>;
  let s2sService: Partial<S2SService>;
  let authenticationService: Partial<AuthenticationService>;
  let updateAppealService;
  let expectedCaseData;

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
          uid: userId,
          name: 'name',
          given_name: 'given',
          family_name: 'family'
        }
      },
      session: {
        appeal: {}
      }
    } as Partial<Request>;

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
          } ],
          'reasonsForAppealDecision': 'I\'ve decided to appeal because ...',
          'reasonsForAppealDocuments': [ {
            'id': 'f29cde8d-e407-4ed1-8137-0eb2f9b3cc42',
            'value': {
              document: {
                'document_url': 'http://dm-store:4506/documents/f29cde8d-e407-4ed1-8137-0eb2f9b3cc42',
                'document_filename': '1580296112615-supporting-evidence-file.jpeg',
                'document_binary_url': 'http://dm-store:4506/documents/f29cde8d-e407-4ed1-8137-0eb2f9b3cc42/binary'
              }
            }
          }
          ],
          'respondentDocuments': [
            {
              'id': '1',
              'value': {
                'tag': 'respondentEvidence',
                'document': {
                  'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
                  'document_filename': 'Screenshot.png',
                  'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
                },
                'description': 'Screenshot of evidence',
                'dateUploaded': '2020-02-21'
              }
            }
          ],
          'timeExtensions': [
            {value: {
              requestedDate: '2020-01-01',
              reason: 'first reason',
              status: 'completed',
              evidence: [],
              state: 'awaitingReasonsForAppeal'
            }},
            {value: {
              reason: 'some reason',
              status: 'inProgress',
              state: 'awaitingReasonsForAppeal',
              evidence: [{
                value: {
                  'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
                  'document_filename': 'expected_time_extension_evidence.png',
                  'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
                }
              }],
              type: 'awaitingReasonsForAppeal'
            }}
          ]
        }
      });
  })
  ;

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
      expect(req.session.appeal.application.lateAppeal.evidence.name).eq('1580296112615-evidence-file.jpeg');
      validateUuid(req.session.appeal.application.lateAppeal.evidence.fileId);
      expect(req.session.appeal.application.contactDetails.email).eq('email@example.net');
      expect(req.session.appeal.application.contactDetails.phone).eq('07123456789');
      expect(req.session.appeal.application.contactDetails.wantsEmail).eq(true);
      expect(req.session.appeal.application.contactDetails.wantsSms).eq(true);
      expect(req.session.appeal.reasonsForAppeal.applicationReason).eq('I\'ve decided to appeal because ...');
      expect(req.session.appeal.reasonsForAppeal.evidences).to.exist;
      expect(req.session.appeal.documentMap).to.exist;
      expect(req.session.appeal.respondentDocuments).to.exist;
      expect(req.session.appeal.respondentDocuments[0].dateUploaded).to.be.eq('2020-02-21');
      expect(req.session.appeal.respondentDocuments[0].evidence).to.exist;
      validateUuid(req.session.appeal.respondentDocuments[0].evidence.fileId);
      expect(req.session.appeal.respondentDocuments[0].evidence.name).to.be.eq('Screenshot.png');
      expect(req.session.appeal.askForMoreTime.reason).to.be.eq('some reason');
      expect(req.session.appeal.askForMoreTime.requestedDate).to.be.undefined;
      expect(req.session.appeal.askForMoreTime.evidence.length).to.be.eq(1);
      validateUuid(req.session.appeal.askForMoreTime.evidence[0].fileId);
      expect(req.session.appeal.askForMoreTime.evidence[0].name).to.be.eq('expected_time_extension_evidence.png');
      expect(req.session.appeal.askForMoreTime.state).to.be.eq('awaitingReasonsForAppeal');
    });

    it('load time extensions when no time extensions', async () => {
      expectedCaseData.timeExtensions = undefined;

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      expect(req.session.appeal.askForMoreTime).to.be.eql({});
      expect(req.session.appeal.previousAskForMoreTime).to.be.eql([]);
    });

    it('load time extensions when one previous time extensions inProgress', async () => {
      expectedCaseData.timeExtensions = [
        { value: aTimeExtension('some reason', 'expected_time_extension_evidence.png', 'inProgress') }
      ];

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      checkAskForMoreTime('some reason', 'expected_time_extension_evidence.png', 'inProgress', 'awaitingReasonsForAppeal', req.session.appeal.askForMoreTime);

      expect(req.session.appeal.previousAskForMoreTime).to.be.eql([]);
    });

    it('load time extensions when no inProgress time extensions', async () => {
      expectedCaseData.timeExtensions = [
        { value: aTimeExtension('some reason', 'expected_time_extension_evidence.png', 'submitted') }
      ];

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      expect(req.session.appeal.askForMoreTime).to.be.eql({});
      expect(req.session.appeal.previousAskForMoreTime.length).to.be.eq(1);
      checkAskForMoreTime('some reason', 'expected_time_extension_evidence.png', 'submitted', 'awaitingReasonsForAppeal', req.session.appeal.previousAskForMoreTime[0]);
    });

    it('load time extensions when inProgress time extensions and previous time extensions', async () => {
      expectedCaseData.timeExtensions = [
        { value: aTimeExtension('some reason submitted', 'expected_time_extension_evidence_submitted.png', 'submitted') },
        { value: aTimeExtension('some reason in progress', 'expected_time_extension_evidence_in_progress.png', 'inProgress') }
      ];

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      checkAskForMoreTime('some reason in progress', 'expected_time_extension_evidence_in_progress.png', 'inProgress', 'awaitingReasonsForAppeal', req.session.appeal.askForMoreTime);

      expect(req.session.appeal.previousAskForMoreTime.length).to.be.eq(1);
      checkAskForMoreTime('some reason submitted', 'expected_time_extension_evidence_submitted.png', 'submitted', 'awaitingReasonsForAppeal', req.session.appeal.previousAskForMoreTime[0]);
    });

    it('load time extensions when inProgress time extensions is not for current state and previous time extensions', async () => {
      expectedCaseData.timeExtensions = [
        { value: aTimeExtension('some reason submitted', 'expected_time_extension_evidence_submitted.png', 'submitted') },
        { value: aTimeExtension('some reason in progress', 'expected_time_extension_evidence_in_progress.png', 'inProgress', 'someOtherState') }
      ];
      expectedCaseData.state = 'awaitingReasonsForAppeal';

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      expect(req.session.appeal.askForMoreTime).to.be.eql({});
      expect(req.session.appeal.previousAskForMoreTime.length).to.be.eq(2);
      checkAskForMoreTime('some reason submitted', 'expected_time_extension_evidence_submitted.png', 'submitted', 'awaitingReasonsForAppeal', req.session.appeal.previousAskForMoreTime[0]);
      checkAskForMoreTime('some reason in progress', 'expected_time_extension_evidence_in_progress.png', 'inProgress', 'someOtherState', req.session.appeal.previousAskForMoreTime[1]);
    });

    function aTimeExtension(reason: string, documentFileName: string, status: string, state: string = 'awaitingReasonsForAppeal') {
      return {
        dateRequested: null,
        reason: reason,
        status: status,
        state: state,
        requestedDate: '2020-01-01T00:00:00.000',
        evidence: [{
          value: {
            'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
            'document_filename': documentFileName,
            'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
          }
        }]
      };
    }

    function checkAskForMoreTime(reason: string, evidenceName: string, status: string, state: string, askForMoreTime: AskForMoreTime) {
      expect(askForMoreTime.reason).to.be.eq(reason);
      expect(askForMoreTime.evidence.length).to.be.eq(1);
      validateUuid(askForMoreTime.evidence[0].fileId);
      expect(askForMoreTime.evidence[0].name).to.be.eq(evidenceName);
      expect(askForMoreTime.state).to.be.eq(state);
      expect(askForMoreTime.status).to.be.eq(status);
      expect(askForMoreTime.requestedDate).to.be.eq('2020-01-01T00:00:00.000');
    }
  });

  describe('convert to ccd case', () => {
    let emptyApplication;
    beforeEach(() => {
      emptyApplication = {
        application: {
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
        } as Partial<AppealApplication>,
        askForMoreTime: {
          reason: null
        }
      } as Partial<Appeal>;
    });

    it('converts empty application', () => {
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', timeExtensions: [] });
    });

    it('converts home office reference number', () => {
      emptyApplication.application.homeOfficeRefNumber = 'ref';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', timeExtensions: [], homeOfficeReferenceNumber: 'ref' });
    });

    describe('converts home office letter date', () => {
      it('full date', () => {
        emptyApplication.application.dateLetterSent = { year: '2019', month: '12', day: '11' };
        emptyApplication.application.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-12-11',
          submissionOutOfTime: 'Yes',
          timeExtensions: []
        });
      });

      it('day and month leading 0', () => {
        emptyApplication.application.dateLetterSent = { year: '2019', month: '02', day: '01' };
        emptyApplication.application.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-02-01',
          submissionOutOfTime: 'Yes',
          timeExtensions: []
        });
      });

      it('day and month no leading 0', () => {
        emptyApplication.application.dateLetterSent = { year: '2019', month: '2', day: '3' };
        emptyApplication.application.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-02-03',
          submissionOutOfTime: 'Yes',
          timeExtensions: []
        });
      });
    });

    it('converts given names', () => {
      emptyApplication.application.personalDetails.givenNames = 'givenNames';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', timeExtensions: [], appellantGivenNames: 'givenNames' });
    });

    it('converts family name', () => {
      emptyApplication.application.personalDetails.familyName = 'familyName';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', timeExtensions: [], appellantFamilyName: 'familyName' });
    });

    describe('converts date of birth', () => {
      it('full date', () => {
        emptyApplication.application.personalDetails = {
          dob: { year: '2019', month: '12', day: '11' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', appellantDateOfBirth: '2019-12-11', timeExtensions: [] });
      });

      it('day and month leading 0', () => {
        emptyApplication.application.personalDetails = {
          dob: { year: '2019', month: '02', day: '01' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', appellantDateOfBirth: '2019-02-01', timeExtensions: [] });
      });

      it('day and month no leading 0', () => {
        emptyApplication.application.personalDetails = {
          dob: { year: '2019', month: '2', day: '3' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql({ journeyType: 'aip', appellantDateOfBirth: '2019-02-03', timeExtensions: [] });
      });
    });
    it('converts appealType', () => {
      emptyApplication.application.appealType = 'appealType';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql({ journeyType: 'aip', timeExtensions: [], appealType: 'appealType' });
    });
    describe('converts contact details', () => {
      it('converts contactDetails for both email and phone', () => {
        emptyApplication.application.contactDetails.wantsEmail = true;
        emptyApplication.application.contactDetails.email = 'abc@example.net';
        emptyApplication.application.contactDetails.wantsSms = true;
        emptyApplication.application.contactDetails.phone = '07123456789';
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql(
          {
            journeyType: 'aip',
            timeExtensions: [],
            subscriptions: [
              {
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
        emptyApplication.application.contactDetails.wantsEmail = true;
        emptyApplication.application.contactDetails.email = 'abc@example.net';
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql(
          {
            journeyType: 'aip',
            timeExtensions: [],
            subscriptions: [
              {
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
        emptyApplication.application.contactDetails.wantsSms = true;
        emptyApplication.application.contactDetails.phone = '07123456789';
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).eql(
          {
            journeyType: 'aip',
            timeExtensions: [],
            subscriptions: [
              {
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

    it('converts time extension when no previous time extensions or current time extensions', () => {
      emptyApplication.askForMoreTime = {};
      emptyApplication.previousAskForMoreTime = [];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql(
        {
          journeyType: 'aip',
          timeExtensions: []
        }
      );
    });

    it('converts time extension when no previous time extensions', () => {
      emptyApplication.askForMoreTime.reason = 'more time reason';
      emptyApplication.askForMoreTime.status = 'inProgress';
      emptyApplication.askForMoreTime.state = 'awaitingReasonsForAppeal';
      emptyApplication.askForMoreTime.reviewTimeExtensionRequired = 'Yes';
      emptyApplication.askForMoreTime.evidence = [
        {
          id: 'id',
          fileId: 'fileId',
          name: 'name'
        }
      ];
      emptyApplication.documentMap = [{ id: 'fileId', url: 'someurl' }] as DocumentMap[];
      emptyApplication.previousAskForMoreTime = [];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql(
        {
          journeyType: 'aip',
          reviewTimeExtensionRequired: 'Yes',
          timeExtensions: [{
            value: {
              reason: 'more time reason',
              status: 'inProgress',
              state: 'awaitingReasonsForAppeal',
              requestedDate: undefined,
              evidence: [{
                value: {
                  document_binary_url: 'someurl/binary',
                  document_filename: 'name',
                  document_url: 'someurl'
                }
              }]
            }
          }]
        }
      );
    });

    it('converts time extension when no current time extensions but previous ones', () => {
      emptyApplication.askForMoreTime = {};

      emptyApplication.previousAskForMoreTime = [{
        reason: 'more time reason',
        status: 'submitted',
        state: 'awaitingReasonsForAppeal',
        requestedDate: '2020-01-01T00:00:00.000',
        evidence: [
          {
            id: 'id',
            fileId: 'fileId',
            name: 'name'
          }
        ]
      }];
      emptyApplication.documentMap = [{ id: 'fileId', url: 'someurl' }] as DocumentMap[];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql(
        {
          journeyType: 'aip',
          timeExtensions: [{
            value: {
              reason: 'more time reason',
              status: 'submitted',
              state: 'awaitingReasonsForAppeal',
              requestedDate: '2020-01-01T00:00:00.000',
              evidence: [{
                value: {
                  document_binary_url: 'someurl/binary',
                  document_filename: 'name',
                  document_url: 'someurl'
                }
              }]
            }
          }]
        }
      );
    });

    it('converts time extension when current time extensions and previous ones', () => {
      emptyApplication.askForMoreTime = {
        reason: 'more time reason in progress',
        status: 'inProgress',
        state: 'awaitingReasonsForAppeal',
        evidence: [
          {
            id: 'id1',
            fileId: 'fileId1',
            name: 'name1'
          }
        ]
      };

      emptyApplication.previousAskForMoreTime = [{
        reason: 'more time reason',
        status: 'submitted',
        state: 'awaitingReasonsForAppeal',
        requestedDate: '2020-01-01T00:00:00.000',
        evidence: [
          {
            id: 'id2',
            fileId: 'fileId2',
            name: 'name2'
          }
        ]
      }];
      emptyApplication.documentMap = [
        { id: 'fileId1', url: 'someurl1' },
        { id: 'fileId2', url: 'someurl2' }
      ] as DocumentMap[];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql(
        {
          journeyType: 'aip',
          timeExtensions: [{
            value: {
              reason: 'more time reason',
              status: 'submitted',
              state: 'awaitingReasonsForAppeal',
              requestedDate: '2020-01-01T00:00:00.000',
              evidence: [{
                value: {
                  document_binary_url: 'someurl2/binary',
                  document_filename: 'name2',
                  document_url: 'someurl2'
                }
              }]
            }
          },
          {
            value: {
              reason: 'more time reason in progress',
              status: 'inProgress',
              state: 'awaitingReasonsForAppeal',
              requestedDate: undefined,
              evidence: [{
                value: {
                  document_binary_url: 'someurl1/binary',
                  document_filename: 'name1',
                  document_url: 'someurl1'
                }
              }]
            }
          }]
        }
      );
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
            uid: userId
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
                  name: 'somefile.png',
                  fileId: '00000000-0000-0000-0000-000000000000',
                  dateUploaded:  {
                    year: 2020,
                    month: 1,
                    day: 1
                  },
                  description: 'Some evidence 1'
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
            } as AppealApplication,
            reasonsForAppeal: {
              applicationReason: 'I\'ve decided to appeal because ...',
              evidences: [
                {
                  fileId: '00000000-0000-0000-0000-000000000001',
                  name: 'File1.png',
                  dateUploaded:  {
                    year: 2020,
                    month: 1,
                    day: 1
                  },
                  description: 'Some evidence 1'
                },
                {
                  fileId: '00000000-0000-0000-0000-000000000002',
                  name: 'File2.png',
                  dateUploaded:  {
                    year: 2020,
                    month: 2,
                    day: 2
                  },
                  description: 'Some evidence 2'
                }
              ] as Evidence[]
            },
            respondentDocuments: [
              {
                dateUploaded: '2020-02-21',
                evidence: {
                  fileId: '75d96b97-f453-4084-aecf-3f73738e4ded',
                  name: 'Screenshot 2020-02-21 at 11.49.28.png'
                }
              }
            ],
            documentMap: [
              {
                id: '00000000-0000-0000-0000-000000000000',
                url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000000'
              },
              {
                id: '00000000-0000-0000-0000-000000000001',
                url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000001'
              },
              {
                id: '00000000-0000-0000-0000-000000000002',
                url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000002'
              }
            ],
            askForMoreTime: {
              reason: 'ask for more time reason',
              status: 'inProgress',
              state: 'awaitingReasonsForAppeal',
              requestedDate: undefined,
              evidence: []
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
          document_filename: 'somefile.png',
          document_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000000',
          document_binary_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000000/binary'
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
            value: {
              subscriber: 'appellant',
              wantsEmail: 'Yes',
              email: 'email@example.net',
              wantsSms: 'No',
              mobileNumber: null
            }
          }
        ],
        reasonsForAppealDecision: 'I\'ve decided to appeal because ...',
        reasonsForAppealDocuments: [
          {
            value: {
              dateUploaded: '2020-01-01',
              description: 'Some evidence 1',
              document: {
                document_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000001',
                document_filename: 'File1.png',
                document_binary_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000001/binary'
              }
            }
          },
          {
            value: {
              dateUploaded: '2020-02-02',
              description: 'Some evidence 2',
              document: {
                document_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000002',
                document_filename: 'File2.png',
                document_binary_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000002/binary'
              }
            }
          }
        ],
        timeExtensions: [{
          value: {
            evidence: [],
            reason: 'ask for more time reason',
            status: 'inProgress',
            state: 'awaitingReasonsForAppeal',
            requestedDate: undefined
          }
        }]

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

    it('submits ReasonsForAppeal with ccd', async () => {
      await updateAppealServiceBis.submitEvent(Events.SUBMIT_REASONS_FOR_APPEAL, req as Request);
      expect(ccdService2.updateAppeal).to.have.been.called.calledWith(
        Events.SUBMIT_REASONS_FOR_APPEAL,
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
