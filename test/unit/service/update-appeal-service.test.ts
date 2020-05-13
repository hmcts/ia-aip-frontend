import { Request } from 'express';
import { Events } from '../../../app/data/events';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
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
  let expectedCaseData: Partial<CaseData>;

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

    expectedCaseData = {
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
      'reasonsForAppealDateUploaded': '2020-01-02',
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
        {
          value: {
            decisionReason: 'Time extension has been granted',
            decision: 'granted',
            requestDate: '2020-01-01',
            reason: 'first reason',
            status: 'completed',
            evidence: [],
            state: 'awaitingReasonsForAppeal'
          }
        },
        {
          value: {
            requestDate: '2020-01-02',
            reason: 'some reason',
            status: 'inProgress',
            state: 'awaitingReasonsForAppeal',
            evidence: [ {
              value: {
                'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
                'document_filename': 'expected_time_extension_evidence.png',
                'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
              }
            }]
          }}
      ]
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('loadAppeal', () => {
    it('set case details', async () => {
      ccdServiceMock.expects('loadOrCreateCase')
      .withArgs(userId, { userToken, serviceToken })
      .resolves({
        id: caseId,
        state: 'awaitingReasonsForAppeal',
        case_data: expectedCaseData
      });
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
      expect(req.session.appeal.reasonsForAppeal.uploadDate).eq('2020-01-02');
      expect(req.session.appeal.reasonsForAppeal.evidences).to.exist;
      expect(req.session.appeal.documentMap).to.exist;
      expect(req.session.appeal.respondentDocuments).to.exist;
      expect(req.session.appeal.respondentDocuments[0].dateUploaded).to.be.eq('2020-02-21');
      expect(req.session.appeal.respondentDocuments[0].evidence).to.exist;
      validateUuid(req.session.appeal.respondentDocuments[0].evidence.fileId);
      expect(req.session.appeal.respondentDocuments[0].evidence.name).to.be.eq('Screenshot.png');
      expect(req.session.appeal.askForMoreTime).to.deep.eq({});
    });

    it('load time extensions when no time extensions', async () => {
      expectedCaseData.timeExtensions = undefined;

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          state: 'awaitingReasonsForAppeal',
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      expect(req.session.appeal.askForMoreTime).to.be.eql({});
    });

    it('load time extensions when no inProgress time extensions', async () => {
      expectedCaseData.timeExtensions = [
        { value: aTimeExtension('some reason', 'expected_time_extension_evidence.png', 'submitted') }
      ];

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          state: 'awaitingReasonsForAppeal',
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      expect(req.session.appeal.askForMoreTime).to.be.eql({});
    });

    it('load draftClarifyingQuestion @only', async () => {
      const draftClarifyingQuestion: ClarifyingQuestion<Collection<SupportingDocument>> = {
        id: 'id',
        value: {
          question: 'the questions'
        }
      };

      const appealClarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
        {
          id: 'id',
          value: {
            question: 'the questions',
            answer: '',
            supportingEvidence: []
          }
        }
      ];
      expectedCaseData.draftClarifyingQuestionsAnswers = [{ ...draftClarifyingQuestion }];
      expectedCaseData.directions = [
        {
          id: '3',
          value: {
            tag: 'requestClarifyingQuestions',
            dateDue: '2020-05-07',
            parties: 'appellant',
            dateSent: '2020-04-23',
            explanation: 'You need to answer some questions about your appeal.',
            previousDates: []
          }
        }
      ];

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          state: 'awaitingClarifyingQuestionsAnswers',
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);
      expect(req.session.appeal.draftClarifyingQuestionsAnswers).to.deep.equal(appealClarifyingQuestions);
    });

    function aTimeExtension(reason: string, documentFileName: string, status: string, state: string = 'awaitingReasonsForAppeal') {
      return {
        dateRequested: null,
        reason: reason,
        status: status,
        state: state,
        requestDate: '2020-01-01T00:00:00.000',
        evidence: [ {
          value: {
            'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
            'document_filename': documentFileName,
            'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
          }
        } ]
      };
    }

    function checkAskForMoreTime(reason: string, evidenceName: string, status: string, state: string, askForMoreTime: AskForMoreTime) {
      expect(askForMoreTime.reason).to.be.eq(reason);
      expect(askForMoreTime.evidence.length).to.be.eq(1);
      validateUuid(askForMoreTime.evidence[0].fileId);
      expect(askForMoreTime.evidence[0].name).to.be.eq(evidenceName);
      expect(askForMoreTime.state).to.be.eq(state);
      expect(askForMoreTime.status).to.be.eq(status);
      expect(askForMoreTime.requestDate).to.be.eq('2020-01-01T00:00:00.000');
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

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).eql(
        {
          journeyType: 'aip',
          timeExtensions: []
        }
      );
    });

    it('converts time extension does not persist in progress', () => {
      emptyApplication.askForMoreTime.requestDate = '2020-01-02';
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
      emptyApplication.documentMap = [ { id: 'fileId', url: 'someurl' } ] as DocumentMap[];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).to.deep.eq(
        {
          'journeyType': 'aip',
          'timeExtensions': []
        }
      );
    });

    it('converts time extension and previous timeExtensions', () => {
      emptyApplication.askForMoreTime.requestDate = '2020-01-02';
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

      emptyApplication.timeExtensions = [ {
        evidence: [],
        decision: 'granted',
        decisionReason: 'Request has been granted',
        reason: 'ask for more time reason',
        status: 'granted',
        state: 'awaitingReasonsForAppeal',
        requestDate: '2020-04-21'
      } ];

      emptyApplication.documentMap = [ { id: 'fileId', url: 'someurl' } ] as DocumentMap[];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).to.deep.eq(
        {
          'journeyType': 'aip',
          'timeExtensions': [
            {
              'value': {
                'decision': 'granted',
                'decisionReason': 'Request has been granted',
                'evidence': [],
                'reason': 'ask for more time reason',
                'requestDate': '2020-04-21',
                'state': 'awaitingReasonsForAppeal',
                'status': 'granted'
              }
            }
          ]
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
                  dateUploaded: {
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
              uploadDate: '2020-01-02',
              evidences: [
                {
                  fileId: '00000000-0000-0000-0000-000000000001',
                  name: 'File1.png',
                  dateUploaded: {
                    year: 2020,
                    month: 1,
                    day: 1
                  },
                  description: 'Some evidence 1'
                },
                {
                  fileId: '00000000-0000-0000-0000-000000000002',
                  name: 'File2.png',
                  dateUploaded: {
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
              status: 'submitted',
              state: 'awaitingReasonsForAppeal',
              requestDate: '2020-04-21',
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
        reasonsForAppealDateUploaded: '2020-01-02',
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
        timeExtensions: [ {
          value: {
            decision: null,
            decisionReason: null,
            evidence: [],
            reason: 'ask for more time reason',
            status: 'submitted',
            state: 'awaitingReasonsForAppeal',
            requestDate: '2020-04-21'
          }
        } ]

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
