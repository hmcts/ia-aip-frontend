
import { Request } from 'express';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import IdamService from '../../../app/service/idam-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
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
  let authenticationService: AuthenticationService;
  let updateAppealService: UpdateAppealService;
  let expectedCaseData: Partial<CaseData>;
  let documentManagementService: DocumentManagementService;

  const userId = 'userId';
  const userToken = 'userToken';
  const serviceToken = 'serviceToken';
  const caseId = 'caseId';
  const appealReferenceNumber = 'PA/1234/2022';

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    idamService = new IdamService();
    s2sService = new S2SService();
    authenticationService = new AuthenticationService(idamService as IdamService, s2sService as S2SService);
    ccdService = new CcdService();

    ccdServiceMock = sandbox.mock(ccdService);

    sandbox.stub(idamService, 'getUserToken').returns(userToken);
    sandbox.stub(s2sService, 'getServiceToken').resolves(serviceToken);
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
      .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.HEARING_REQUIREMENTS, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.HEARING_BUNDLE, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.OUT_OF_COUNTRY, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.MAKE_APPLICATION, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.FTPA, false).resolves(false)
      .withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(false);
    documentManagementService = new DocumentManagementService(authenticationService);

    updateAppealService = new UpdateAppealService(ccdService as CcdService, authenticationService, null, documentManagementService);
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
      'appellantInUk': 'undefined',
      'hasSponsor': 'No',
      'sponsorGivenNames': 'ABC XYZ',
      'sponsorFamilyName': 'ABC XYZ',
      'sponsorNameForDisplay': 'ABC XYZ',
      'sponsorAuthorisation': 'ABC XYZ',
      'outsideUkWhenApplicationMade': 'No',
      'gwfReferenceNumber': '',
      'dateClientLeaveUk': '2022-02-19',
      'journeyType': 'aip',
      'homeOfficeReferenceNumber': 'A1234567',
      'appealReferenceNumber': 'PA/1234/2022',
      'homeOfficeDecisionDate': '2019-01-02',
      'appellantFamilyName': 'Pedro',
      'appellantGivenNames': 'Jimenez',
      'appellantDateOfBirth': '1990-03-21',
      'appellantNationalities': [{ 'id': '0f583a62-e98a-4a76-abe2-130ad5547726', 'value': { 'code': 'AF' } }],
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
      'recordedOutOfTimeDecision': 'No',
      'applicationOutOfTimeExplanation': 'An Explanation on why this appeal was late',
      'applicationOutOfTimeDocument': {
        'document_url': 'http://dm-store:4506/documents/9f788e06-cc7d-4bf9-8d73-418b5fdcf891',
        'document_filename': '1580296112615-evidence-file.jpeg',
        'document_binary_url': 'http://dm-store:4506/documents/9f788e06-cc7d-4bf9-8d73-418b5fdcf891/binary'
      },
      'subscriptions': [{
        'id': '7166f13d-1f99-4323-9459-b22a8325db9d',
        'value': {
          'subscriber': 'appellant',
          'email': 'email@example.net',
          'wantsSms': 'Yes',
          'mobileNumber': '07123456789',
          'wantsEmail': 'Yes'
        }
      }],
      'reasonsForAppealDecision': 'I\'ve decided to appeal because ...',
      'reasonsForAppealDateUploaded': '2020-01-02',
      'reasonsForAppealDocuments': [{
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
          id: '2',
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
          id: '1',
          value: {
            requestDate: '2020-01-02',
            reason: 'some reason',
            status: 'inProgress',
            state: 'awaitingReasonsForAppeal',
            evidence: [{
              value: {
                'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
                'document_filename': 'expected_time_extension_evidence.png',
                'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
              }
            }]
          }
        }
      ],
      isInterpreterServicesNeeded: 'false',
      isHearingRoomNeeded: 'true',
      isHearingLoopNeeded: 'true',
      hearingCentre: 'birmingham'
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
      await updateAppealService.loadAppeal(req as Request);
      expect(req.session.appeal.ccdCaseId).eq(caseId);
      expect(req.session.appeal.appealReferenceNumber).eq(appealReferenceNumber);
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
      expect(req.session.appeal.askForMoreTime).to.deep.eq({ inFlight: false });
      expect(req.session.appeal.cmaRequirements.accessNeeds.isInterpreterServicesNeeded).to.eq(false);
      expect(req.session.appeal.cmaRequirements.accessNeeds.isHearingLoopNeeded).to.eq(false);
      expect(req.session.appeal.cmaRequirements.accessNeeds.isHearingRoomNeeded).to.eq(false);
      expect(req.session.appeal.hearingCentre).eq('birmingham');
      expect(req.session.appeal.application.hasSponsor).eq('No');
      expect(req.session.appeal.application.sponsorGivenNames).eq('ABC XYZ');
      expect(req.session.appeal.application.sponsorFamilyName).eq('ABC XYZ');
      expect(req.session.appeal.application.sponsorNameForDisplay).eq('ABC XYZ');
      expect(req.session.appeal.application.sponsorAuthorisation).eq('ABC XYZ');
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

      expect(req.session.appeal.askForMoreTime).to.be.eql(
        { inFlight: false });
    });

    it('load CQ from directions object', async () => {

      const directionsClarifyingQuestions: ClarifyingQuestion<Collection<SupportingDocument>>[] = [
        {
          id: '947398d5-bd81-4e7f-b3ed-1be73be5ba56',
          value: {
            dateSent: '2020-04-23',
            dueDate: '2020-05-07',
            question: 'Give us some more information about:\n- What are their ages?\n  - What are their names?',
            directionId: 'directionId'
          }
        }
      ];

      const appealClarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
        {
          id: '947398d5-bd81-4e7f-b3ed-1be73be5ba56',
          value: {
            dateSent: '2020-04-23',
            dueDate: '2020-05-07',
            question: 'Give us some more information about:\n- What are their ages?\n  - What are their names?',
            directionId: 'directionId'
          }
        },
        {
          value: {
            dateSent: '2020-04-23',
            dueDate: '2020-05-07',
            question: 'Do you want to tell us anything else about your case?',
            directionId: 'directionId'
          }
        }
      ];
      expectedCaseData.directions = [
        {
          id: '3',
          value: {
            tag: 'requestClarifyingQuestions',
            dateDue: '2020-05-07',
            parties: 'appellant',
            dateSent: '2020-04-23',
            explanation: 'You need to answer some questions about your appeal.',
            previousDates: [],
            uniqueId: 'directionId',
            clarifyingQuestions: directionsClarifyingQuestions
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

    it('load draftClarifyingQuestion', async () => {
      const draftClarifyingQuestion: ClarifyingQuestion<Collection<SupportingDocument>> = {
        id: 'id',
        value: {
          dateSent: '2020-04-23',
          dueDate: '2020-05-07',
          question: 'the questions',
          answer: 'draft answer',
          dateResponded: '2020-05-01',
          directionId: 'directionId'
        }
      };

      const appealClarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
        {
          id: 'id',
          value: {
            dateSent: '2020-04-23',
            dueDate: '2020-05-07',
            question: 'the questions',
            answer: 'draft answer',
            dateResponded: '2020-05-01',
            supportingEvidence: [],
            directionId: 'directionId'
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
            previousDates: [],
            uniqueId: 'directionId',
            clarifyingQuestions: [
              {
                id: '947398d5-bd81-4e7f-b3ed-1be73be5ba56',
                value: {
                  question: 'Give us some more information about:\n- What are their ages?\n  - What are their names?'
                }
              },
              {
                id: 'ddc8a194-30b3-40d9-883e-d034a7451170',
                value: {
                  question: 'Tell us more about your health issues\n- How long have you suffered from this problem?\n- How does it affect your daily life?'
                }
              }
            ]
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

    it('load clarifyingQuestion', async () => {
      expectedCaseData.draftClarifyingQuestionsAnswers = null;
      expectedCaseData.directions = [
        {
          id: '3',
          value: {
            tag: 'requestClarifyingQuestions',
            dateDue: '2020-05-07',
            parties: 'appellant',
            dateSent: '2020-04-23',
            explanation: 'You need to answer some questions about your appeal.',
            clarifyingQuestions: [
              {
                value: {
                  question: 'the questions'
                }
              }
            ],
            previousDates: [],
            uniqueId: 'directionId'
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

      const appealClarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
        {
          value: {
            dateSent: '2020-04-23',
            dueDate: '2020-05-07',
            question: 'the questions',
            directionId: 'directionId'
          }
        },
        {
          value: {
            dateSent: '2020-04-23',
            dueDate: '2020-05-07',
            question: 'Do you want to tell us anything else about your case?',
            directionId: 'directionId'
          }
        }
      ];
      expect(req.session.appeal.draftClarifyingQuestionsAnswers).to.deep.equal(appealClarifyingQuestions);
    });

    it('load cmaRequirements', async () => {

      expectedCaseData = {
        ...expectedCaseData,
        datesToAvoid: [{
          value: {
            dateToAvoid: '2020-06-23',
            dateToAvoidReason: 'I have an important appointment on this day'
          }
        }, {
          value: { dateToAvoid: '2020-06-24', dateToAvoidReason: 'I need this day off' }
        }],
        datesToAvoidYesNo: 'Yes',
        inCameraCourt: 'Yes',
        inCameraCourtDescription: 'The reason why I would need a private appointment',
        interpreterLanguage: [{ value: { language: 'Afar', languageDialect: 'A dialect' } }],
        isHearingLoopNeeded: 'Yes',
        isHearingRoomNeeded: 'Yes',
        isInterpreterServicesNeeded: 'Yes',
        multimediaEvidence: 'Yes',
        multimediaEvidenceDescription: 'I do not own the equipment',
        pastExperiences: 'Yes',
        pastExperiencesDescription: 'Past experiences description',
        physicalOrMentalHealthIssues: 'Yes',
        physicalOrMentalHealthIssuesDescription: 'Reason for mental health conditions',
        singleSexCourt: 'Yes',
        singleSexCourtType: 'All female',
        singleSexCourtTypeDescription: 'The reason why I will need an all-female',
        additionalRequests: 'Yes',
        additionalRequestsDescription: 'Anything else description'
      };

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          state: 'awaitingCmaRequirements',
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      const expectedCmaRequirements = {
        'accessNeeds': {
          'interpreterLanguage': [
            {
              'value': {
                'language': 'Afar',
                'languageDialect': 'A dialect'
              }
            }
          ],
          'isHearingLoopNeeded': true,
          'isHearingRoomNeeded': true,
          'isInterpreterServicesNeeded': true
        },
        'otherNeeds': {
          'anythingElse': true,
          'anythingElseReason': 'Anything else description',
          'bringOwnMultimediaEquipment': false,
          'bringOwnMultimediaEquipmentReason': 'I do not own the equipment',
          'healthConditions': true,
          'healthConditionsReason': 'Reason for mental health conditions',
          'multimediaEvidence': true,
          'pastExperiences': true,
          'pastExperiencesReason': 'Past experiences description',
          'privateAppointment': true,
          'privateAppointmentReason': 'The reason why I would need a private appointment',
          'singleSexAppointment': true,
          'singleSexAppointmentReason': 'The reason why I will need an all-female',
          'singleSexTypeAppointment': 'All female'
        },
        'datesToAvoid': {
          'isDateCannotAttend': true,
          'dates': [
            {
              'date': {
                'day': '23',
                'month': '6',
                'year': '2020'
              },
              'reason': 'I have an important appointment on this day'
            },
            {
              'date': {
                'day': '24',
                'month': '6',
                'year': '2020'
              },
              'reason': 'I need this day off'
            }
          ]
        }
      };
      expect(req.session.appeal.cmaRequirements).to.be.eql(expectedCmaRequirements);
    });

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
          outsideUkWhenApplicationMade: null,
          gwfReferenceNumber: null,
          dateClientLeaveUk: {
            year: null,
            month: null,
            day: null
          },
          dateLetterSent: {
            year: null,
            month: null,
            day: null
          },
          decisionLetterReceivedDate: {
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

      expect(caseData).contains({
        journeyType: 'aip'
      });
    });

    it('converts home office reference number', () => {
      emptyApplication.application.homeOfficeRefNumber = 'ref';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).contains({
        journeyType: 'aip',
        homeOfficeReferenceNumber: 'ref'
      });
    });

    describe('converts home office letter date', () => {
      it('full date', () => {
        emptyApplication.application.dateLetterSent = { year: '2019', month: '12', day: '11' };
        emptyApplication.application.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).contains({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-12-11',
          submissionOutOfTime: 'Yes',
          applicationOutOfTimeDocument: null
        });
      });

      it('day and month leading 0', () => {
        emptyApplication.application.dateLetterSent = { year: '2019', month: '02', day: '01' };
        emptyApplication.application.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).contains({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-02-01',
          submissionOutOfTime: 'Yes',
          applicationOutOfTimeDocument: null
        });
      });

      it('day and month no leading 0', () => {
        emptyApplication.application.dateLetterSent = { year: '2019', month: '2', day: '3' };
        emptyApplication.application.isAppealLate = true;
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);
        expect(caseData).contains({
          journeyType: 'aip',
          homeOfficeDecisionDate: '2019-02-03',
          submissionOutOfTime: 'Yes',
          applicationOutOfTimeDocument: null
        });
      });
    });

    it('converts given names', () => {
      emptyApplication.application.personalDetails.givenNames = 'givenNames';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).contains({
        journeyType: 'aip',
        appellantGivenNames: 'givenNames'
      });
    });

    it('converts family name', () => {
      emptyApplication.application.personalDetails.familyName = 'familyName';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).contains({
        journeyType: 'aip',
        appellantFamilyName: 'familyName'
      });
    });

    describe('converts date of birth', () => {
      it('full date', () => {
        emptyApplication.application.personalDetails = {
          dob: { year: '2019', month: '12', day: '11' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).contains({
          journeyType: 'aip',
          appellantDateOfBirth: '2019-12-11'
        });
      });

      it('day and month leading 0', () => {
        emptyApplication.application.personalDetails = {
          dob: { year: '2019', month: '02', day: '01' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).contains({
          journeyType: 'aip',
          appellantDateOfBirth: '2019-02-01'
        });
      });

      it('day and month no leading 0', () => {
        emptyApplication.application.personalDetails = {
          dob: { year: '2019', month: '2', day: '3' }
        };
        const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

        expect(caseData).contains({
          journeyType: 'aip',
          appellantDateOfBirth: '2019-02-03'
        });
      });
    });
    it('converts appealType', () => {
      emptyApplication.application.appealType = 'appealType';
      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).contains({
        journeyType: 'aip',
        appealType: 'appealType'
      });
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
            appellantEmailAddress: 'abc@example.net',
            appellantPhoneNumber: '07123456789',
            appellantInUk: 'undefined',
            gwfReferenceNumber: null,
            journeyType: 'aip',
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
            appellantInUk: 'undefined',
            gwfReferenceNumber: null,
            appellantEmailAddress: 'abc@example.net',
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
            appellantInUk: 'undefined',
            appellantPhoneNumber: '07123456789',
            gwfReferenceNumber: null,
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

      expect(caseData).contains(
        {
          journeyType: 'aip'
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

      emptyApplication.timeExtensions = [{
        evidence: [],
        decision: 'granted',
        decisionReason: 'Request has been granted',
        reason: 'ask for more time reason',
        status: 'granted',
        state: 'awaitingReasonsForAppeal',
        requestDate: '2020-04-21'
      }];

      emptyApplication.documentMap = [{ id: 'fileId', url: 'someurl' }] as DocumentMap[];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);

      expect(caseData).to.deep.eq(
        {
          'journeyType': 'aip',
          'appellantInUk': 'undefined',
          'gwfReferenceNumber': null,
          'reviewTimeExtensionRequired': 'Yes',
          'submitTimeExtensionReason': 'more time reason',
          'submitTimeExtensionEvidence': [
            {
              'value': {
                'document_binary_url': 'someurl/binary',
                'document_filename': 'name',
                'document_url': 'someurl'

              }
            }
          ]
        }
      );
    });
    it('converts time extension to makeAnApplicationEvidence', () => {
      emptyApplication.documentMap = [{ id: 'fileId', url: 'someurl' }] as DocumentMap[];
      emptyApplication.makeAnApplicationEvidence = [
        {
          id: 'id',
          fileId: 'fileId',
          name: 'name'
        }
      ];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);
      expect(caseData).to.deep.eq({
        'journeyType': 'aip',
        'appellantInUk': 'undefined',
        'gwfReferenceNumber': null,
        'makeAnApplicationEvidence': [
          {
            'id': 'id',
            'value': {
              'document_binary_url': 'someurl/binary',
              'document_filename': 'name',
              'document_url': 'someurl'
            }
          }
        ]
      });
    });
    it('converts uploadTheNoticeOfDecisionDocs', () => {
      emptyApplication.documentMap = [{ id: 'fileId', url: 'someurl' }] as DocumentMap[];
      emptyApplication.application.homeOfficeLetter = [
        {
          'id': 'id',
          'fileId': 'fileId',
          'name': 'name',
          'description': 'description',
          'dateUploaded': '2021-06-01'
        }
      ];

      const caseData = updateAppealService.convertToCcdCaseData(emptyApplication);
      expect(caseData).to.deep.eq({
        'journeyType': 'aip',
        'appellantInUk': 'undefined',
        'gwfReferenceNumber': null,
        'uploadTheNoticeOfDecisionDocs': [
          {
            'id': 'fileId',
            'value': {
              'dateUploaded': '2021-06-01',
              'description': 'description',
              'document': {
                'document_binary_url': 'someurl/binary',
                'document_filename': 'name',
                'document_url': 'someurl'
              },
              'tag': 'additionalEvidence'
            }
          }
        ]
      });
    });
  });

  describe('mapCcdCaseToAppeal', () => {
    describe('legalRepresentativeDocuments @legal', () => {
      const caseData: Partial<CaseData> = {
        'tribunalDocuments': [
          {
            'id': '1',
            'value': {
              'tag': 'endAppeal',
              'document': {
                'document_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6',
                'document_filename': 'PA 50002 2021-perez-NoticeOfEndedAppeal.PDF',
                'document_binary_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2021-06-01'
            }
          }
        ],
        'legalRepresentativeDocuments': [
          {
            'id': '1',
            'value': {
              'tag': 'appealSubmission',
              'document': {
                'document_url': 'http://dm-store:8080/documents/d8b3ef28-f67f-4859-86e2-1d34dde208bb',
                'document_filename': 'PA 50002 2021-perez-appeal-form.PDF',
                'document_binary_url': 'http://dm-store:8080/documents/d8b3ef28-f67f-4859-86e2-1d34dde208bb/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2021-05-26'
            }
          }
        ]
      };

      const appeal: Partial<CcdCaseDetails> = {
        case_data: caseData as CaseData
      };
      it('should map docs to appeal evidences', () => {
        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);

        expect(mappedAppeal.tribunalDocuments).to.be.length(1);
        expect(mappedAppeal.legalRepresentativeDocuments).to.be.length(1);
      });
    });

    describe('hearingDocuments @legal', () => {
      const caseData: Partial<CaseData> = {
        'hearingDocuments': [
          {
            'id': '1',
            'value': {
              'tag': 'endAppeal',
              'document': {
                'document_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6',
                'document_filename': 'PA 50001 2022-User-hearing-bundle.PDF',
                'document_binary_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2021-06-01'
            }
          }
        ]
      };

      const appeal: Partial<CcdCaseDetails> = {
        case_data: caseData as CaseData
      };
      it('should map docs to hearing documents', () => {
        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);

        expect(mappedAppeal.hearingDocuments).to.be.length(1);
      });
    });

    describe('additionalEvidenceDocuments', () => {
      const caseData: Partial<CaseData> = {
        'additionalEvidenceDocuments': [
          {
            'id': '1',
            'value': {
              'tag': 'endAppeal',
              'document': {
                'document_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6',
                'document_filename': 'PA 50002 2021-perez-NoticeOfEndedAppeal.PDF',
                'document_binary_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2021-06-01'
            }
          }
        ]
      };

      const appeal: Partial<CcdCaseDetails> = {
        case_data: caseData as CaseData
      };
      it('should map docs to hearing documents', () => {
        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);

        expect(mappedAppeal.additionalEvidenceDocuments).to.be.length(1);
      });
    });

    describe('addendumEvidenceDocuments', () => {
      const caseData: Partial<CaseData> = {
        'addendumEvidenceDocuments': [
          {
            'id': '1',
            'value': {
              'tag': 'endAppeal',
              'document': {
                'document_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6',
                'document_filename': 'PA 50002 2021-perez-NoticeOfEndedAppeal.PDF',
                'document_binary_url': 'http://dm-store:8080/documents/59c0a265-1fd8-4698-9b75-d7438870d6e6/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2021-06-01'
            }
          }
        ]
      };

      const appeal: Partial<CcdCaseDetails> = {
        case_data: caseData as CaseData
      };
      it('should map docs correctly to appeal', () => {
        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);

        expect(mappedAppeal.addendumEvidenceDocuments).to.be.length(1);
      });
    });

    describe('mapHearingOtherNeedsFromCCDCase should map multimediaEvidence correctly to appeal', () => {
      it('when taken case over from legalrep, not bringing own equipment', () => {
        const caseData: Partial<CaseData> = {
          'remoteVideoCall': 'No',
          'multimediaEvidence': 'Yes',
          'multimediaEvidenceDescription': 'description'
        };
        const appeal: Partial<CcdCaseDetails> = {
          case_data: caseData as CaseData
        };

        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);

        expect(mappedAppeal.hearingRequirements.otherNeeds.multimediaEvidence).eq(true);
        expect(mappedAppeal.hearingRequirements.otherNeeds.bringOwnMultimediaEquipment).eq(false);
        expect(mappedAppeal.hearingRequirements.otherNeeds.bringOwnMultimediaEquipmentReason).eq('description');
      });

      it('when taken case over from legalrep, bringing own equipment', () => {
        const caseData: Partial<CaseData> = {
          'remoteVideoCall': 'No',
          'multimediaEvidence': 'Yes'
        };
        const appeal: Partial<CcdCaseDetails> = {
          case_data: caseData as CaseData
        };

        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);

        expect(mappedAppeal.hearingRequirements.otherNeeds.multimediaEvidence).eq(true);
        expect(mappedAppeal.hearingRequirements.otherNeeds.bringOwnMultimediaEquipment).to.be.eq(true);
        expect(mappedAppeal.hearingRequirements.otherNeeds.bringOwnMultimediaEquipmentReason).is.undefined;
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
            uid: userId
          }
        },
        session: {
          appeal: {
            appealStatus: 'appealStarted',
            application: {
              homeOfficeRefNumber: 'newRef',
              outsideUkWhenApplicationMade: 'No',
              hasSponsor: 'No',
              sponsorGivenNames: 'ABC XYZ',
              sponsorFamilyName: 'ABC XYZ',
              sponsorNameForDisplay: 'ABC XYZ',
              sponsorAuthorisation: 'ABC XYZ',
              gwfReferenceNumber: '',
              appealType: 'appealType',
              dateLetterSent: {
                year: '2019',
                month: '12',
                day: '11'
              },
              dateClientLeaveUk: {
                year: '2019',
                month: '12',
                day: '11'
              },
              decisionLetterReceivedDate: {
                year: '2019',
                month: '12',
                day: '11'
              },
              isAppealLate: true,
              lateAppeal: {
                reason: 'a reason',
                evidence: {
                  name: 'somefile.png',
                  fileId: '00000000-0000-0000-0000-000000000000',
                  dateUploaded: '2020-01-01',
                  'description': 'Some evidence 1',
                  'tag': 'additionalEvidence'
                }
              },
              personalDetails: {
                givenNames: 'givenNames',
                familyName: 'familyName',
                dob: {
                  year: '1980',
                  month: '1',
                  day: '2'
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
                  dateUploaded: '2020-01-01',
                  description: 'Some evidence 1'
                },
                {
                  fileId: '00000000-0000-0000-0000-000000000002',
                  name: 'File2.png',
                  dateUploaded: '2020-02-02',
                  description: 'Some evidence 2'
                }
              ] as Evidence[]
            },
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
      documentManagementService = new DocumentManagementService(authenticationService);
      updateAppealServiceBis = new UpdateAppealService(ccdService2 as CcdService, authenticationService, null, documentManagementService);
      expectedCaseData = {
        journeyType: 'aip',
        appellantInUk: 'undefined',
        homeOfficeReferenceNumber: 'newRef',
        outsideUkWhenApplicationMade: 'No',
        hasSponsor: 'No',
        sponsorGivenNames: 'ABC XYZ',
        sponsorFamilyName: 'ABC XYZ',
        sponsorNameForDisplay: 'ABC XYZ',
        sponsorAuthorisation: 'ABC XYZ',
        gwfReferenceNumber: '',
        homeOfficeDecisionDate: '2019-12-11',
        dateClientLeaveUk: '2019-12-11',
        decisionLetterReceivedDate: '2019-12-11',
        submissionOutOfTime: 'Yes',
        recordedOutOfTimeDecision: 'No',
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
        appellantEmailAddress: 'email@example.net',
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
              tag: 'additionalEvidence',
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
              tag: 'additionalEvidence',
              document: {
                document_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000002',
                document_filename: 'File2.png',
                document_binary_url: 'http://dm-store:4506/documents/00000000-0000-0000-0000-000000000002/binary'
              }
            }
          }
        ],
        submitTimeExtensionEvidence: [],
        submitTimeExtensionReason: 'ask for more time reason'
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

    it('submits cmaRequirements with ccd', async () => {

      req.session.appeal.appealStatus = 'awaitingCmaRequirements';
      req.session.appeal.cmaRequirements = {
        accessNeeds: {
          isInterpreterServicesNeeded: true,
          interpreterLanguage: {
            language: 'Afar',
            languageDialect: 'A dialect'
          },
          isHearingRoomNeeded: true,
          isHearingLoopNeeded: true
        },
        otherNeeds: {
          multimediaEvidence: true,
          bringOwnMultimediaEquipment: false,
          bringOwnMultimediaEquipmentReason: 'I do not own the equipment',
          singleSexAppointment: true,
          singleSexTypeAppointment: 'All female',
          singleSexAppointmentReason: 'The reason why I will need an all-female',
          privateAppointment: true,
          privateAppointmentReason: 'The reason why I would need a private appointment',
          healthConditions: true,
          healthConditionsReason: 'Reason for mental health conditions',
          pastExperiences: true,
          pastExperiencesReason: 'Past experiences description',
          anythingElse: true,
          anythingElseReason: 'Anything else description'
        },
        datesToAvoid: {
          isDateCannotAttend: true,
          dates: [
            {
              date: {
                day: '23',
                month: '06',
                year: '2020'
              },
              reason: 'I have an important appointment on this day'
            },
            {
              date: {
                day: '24',
                month: '06',
                year: '2020'
              },
              reason: 'I need this day off'
            }
          ]
        }

      } as CmaRequirements;
      await updateAppealServiceBis.submitEvent(Events.SUBMIT_CMA_REQUIREMENTS, req as Request);

      expectedCaseData = {
        ...expectedCaseData,
        datesToAvoid: [{
          value: {
            dateToAvoid: '2020-06-23',
            dateToAvoidReason: 'I have an important appointment on this day'
          }
        }, {
          value: { dateToAvoid: '2020-06-24', dateToAvoidReason: 'I need this day off' }
        }],
        datesToAvoidYesNo: 'Yes',
        inCameraCourt: 'Yes',
        inCameraCourtDescription: 'The reason why I would need a private appointment',
        interpreterLanguage: [{ value: { language: 'Afar', languageDialect: 'A dialect' } }],
        isHearingLoopNeeded: 'Yes',
        isHearingRoomNeeded: 'Yes',
        isInterpreterServicesNeeded: 'Yes',
        multimediaEvidence: 'Yes',
        multimediaEvidenceDescription: 'I do not own the equipment',
        pastExperiences: 'Yes',
        pastExperiencesDescription: 'Past experiences description',
        physicalOrMentalHealthIssues: 'Yes',
        physicalOrMentalHealthIssuesDescription: 'Reason for mental health conditions',
        singleSexCourt: 'Yes',
        singleSexCourtType: 'All female',
        singleSexCourtTypeDescription: 'The reason why I will need an all-female',
        additionalRequests: 'Yes',
        additionalRequestsDescription: 'Anything else description'
      };
      expect(ccdService2.updateAppeal).to.have.been.called.calledWith(
        Events.SUBMIT_CMA_REQUIREMENTS,
        userId,
        {
          id: caseId,
          state: 'awaitingCmaRequirements',
          case_data: expectedCaseData
        },
        headers);
    });

    it('submits hearingRequirements with ccd', async () => {

      expectedCaseData = {
        ...expectedCaseData,
        datesToAvoid: [{
          value: {
            dateToAvoid: '2020-06-23',
            dateToAvoidReason: 'I have an important appointment on this day'
          }
        }, {
          value: { dateToAvoid: '2020-06-24', dateToAvoidReason: 'I need this day off' }
        }],
        datesToAvoidYesNo: 'Yes',
        inCameraCourt: 'Yes',
        inCameraCourtDescription: 'The reason why I would need a private appointment',
        interpreterLanguage: [{ value: { language: 'Afar', languageDialect: 'A dialect' } }],
        isHearingLoopNeeded: 'Yes',
        isHearingRoomNeeded: 'Yes',
        remoteVideoCall: 'Yes',
        remoteVideoCallDescription: 'Join Hearing by video call',
        isInterpreterServicesNeeded: 'Yes',
        multimediaEvidence: 'Yes',
        bringOwnMultimediaEquipment: 'No',
        multimediaEvidenceDescription: 'I do not own the equipment',
        pastExperiences: 'Yes',
        pastExperiencesDescription: 'Past experiences description',
        physicalOrMentalHealthIssues: 'Yes',
        physicalOrMentalHealthIssuesDescription: 'Reason for mental health conditions',
        singleSexCourt: 'Yes',
        singleSexCourtType: 'All female',
        singleSexCourtTypeDescription: 'The reason why I will need an all-female',
        additionalRequests: 'Yes',
        additionalRequestsDescription: 'Anything else description'
      };

      ccdServiceMock.expects('loadOrCreateCase')
        .withArgs(userId, { userToken, serviceToken })
        .resolves({
          id: caseId,
          state: 'submitHearingRequirements',
          case_data: expectedCaseData
        });
      await updateAppealService.loadAppeal(req as Request);

      const expectedHearingRequirements = {
        'datesToAvoid': {
          'dates': [
            {
              'date': {
                'day': '23',
                'month': '6',
                'year': '2020'
              },
              'reason': 'I have an important appointment on this day'
            },
            {
              'date': {
                'day': '24',
                'month': '6',
                'year': '2020'
              },
              'reason': 'I need this day off'
            }
          ],
          'isDateCannotAttend': true
        },
        'interpreterLanguages': [
          {
            'language': 'Afar',
            'languageDialect': 'A dialect'
          }
        ],
        'isHearingLoopNeeded': true,
        'isHearingRoomNeeded': true,
        'isInterpreterServicesNeeded': true,
        'otherNeeds': {
          'anythingElse': true,
          'anythingElseReason': 'Anything else description',
          'bringOwnMultimediaEquipment': false,
          'bringOwnMultimediaEquipmentReason': 'I do not own the equipment',
          'healthConditions': true,
          'healthConditionsReason': 'Reason for mental health conditions',
          'multimediaEvidence': true,
          'pastExperiences': true,
          'pastExperiencesReason': 'Past experiences description',
          'privateAppointment': true,
          'privateAppointmentReason': 'The reason why I would need a private appointment',
          'singleSexAppointment': true,
          'singleSexAppointmentReason': 'The reason why I will need an all-female',
          'singleSexTypeAppointment': 'All female',
          'remoteVideoCall': true,
          'remoteVideoCallDescription': 'Join Hearing by video call'
        }
      };
      expect(req.session.appeal.hearingRequirements).to.be.eql(expectedHearingRequirements);
    });

    it('submits hearingRequirements with otherNeeds', async () => {

      req.session.appeal.appealStatus = 'submitHearingRequirements';
      req.session.appeal.hearingRequirements = {

        otherNeeds: {
          multimediaEvidence: true,
          bringOwnMultimediaEquipment: false,
          bringOwnMultimediaEquipmentReason: 'I do not own the equipment',
          singleSexAppointment: true,
          singleSexTypeAppointment: 'All female',
          singleSexAppointmentReason: 'The reason why I will need an all-female',
          privateAppointment: true,
          privateAppointmentReason: 'The reason why I would need a private hearing',
          healthConditions: true,
          healthConditionsReason: 'Reason for mental health conditions',
          pastExperiences: true,
          pastExperiencesReason: 'Past experiences description',
          anythingElse: true,
          anythingElseReason: 'Anything else description',
          remoteVideoCall: true,
          remoteVideoCallDescription: 'Why you are not able to join ?'
        }

      } as HearingRequirements;
      let caseData = updateAppealServiceBis.convertToCcdCaseData(req.session.appeal);
      expect(caseData.inCameraCourt).to.be.equals('Yes');
      expect(caseData.multimediaEvidence).to.be.equals('Yes');
      expect(caseData.pastExperiences).to.be.equals('Yes');
      expect(caseData.physicalOrMentalHealthIssues).to.be.equals('Yes');
      expect(caseData.singleSexCourt).to.be.equals('Yes');
      expect(caseData.additionalRequests).to.be.equals('Yes');
      expect(caseData.remoteVideoCall).to.be.equals('Yes');
    });

    describe('finalDecisionAndReasonsDocuments @legal', () => {
      const caseData: Partial<CaseData> = {
        'finalDecisionAndReasonsDocuments': [
          {
            'id': '2',
            'value': {
              'tag': 'finalDecisionAndReasonsPdf',
              'document': {
                'document_url': 'http://dm-store:8080/documents/ba51fff4-b3c8-485b-b847-6c0962aceaaf',
                'document_filename': 'PA 50012 2022-bond20-Decision-and-reasons-FINAL.pdf',
                'document_binary_url': 'http://dm-store:8080/documents/ba51fff4-b3c8-485b-b847-6c0962aceaaf/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2022-01-26'
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'decisionAndReasonsCoverLetter',
              'document': {
                'document_url': 'http://dm-store:8080/documents/446787de-4b31-43b2-ab40-6d08f1a2934d',
                'document_filename': 'PA 50012 2022-bond20-Decision-and-reasons-Cover-letter.PDF',
                'document_binary_url': 'http://dm-store:8080/documents/446787de-4b31-43b2-ab40-6d08f1a2934d/binary'
              },
              'suppliedBy': '',
              'description': '',
              'dateUploaded': '2022-01-26'
            }
          }
        ]
      };

      const appeal: Partial<CcdCaseDetails> = {
        case_data: caseData as CaseData
      };
      it('should map docs to decision and Reasons documents', () => {
        const mappedAppeal = updateAppealService.mapCcdCaseToAppeal(appeal as CcdCaseDetails);
        expect(mappedAppeal.finalDecisionAndReasonsDocuments).to.be.length(2);
      });
    });

  });
});
