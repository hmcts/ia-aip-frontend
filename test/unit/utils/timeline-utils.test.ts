import { Request } from 'express';
import { Events } from '../../../app/data/events';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import {
  constructSection,
  getApplicationEvents,
  getDirectionHistory,
  getEventsAndStates,
  getSubmitClarifyingQuestionsEvents
} from '../../../app/utils/timeline-utils';
import { expect, sinon } from '../../utils/testUtils';
import { expectedEventsWithTimeExtensionsData } from '../mockData/events/expectation/expected-events-with-time-extensions';

describe('timeline-utils', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {},
      session: {
        appeal: {
          application: {},
          caseBuilding: {},
          reasonsForAppeal: {},
          nonStandardDirectionEnabled: true,
          readonlyApplicationEnabled: true
        }
      },
      idam: {
        userDetails: {
          forename: 'forename',
          surname: 'surname',
          uid: 'appellant'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as unknown as Partial<Request>;

  });

  afterEach(() => {
    sandbox.restore();
    LaunchDarklyService.close();
  });

  describe('constructSection', () => {

    it('Should construct the appeal details section', () => {
      req.session.appeal.timeExtensionEventsMap = [];
      const appealDetailsSection = [Events.SUBMIT_APPEAL.id];

      const result = constructSection(appealDetailsSection, expectedEventsWithTimeExtensionsData, null, req as Request);
      expect(result).to.deep.eq(
        [{
          'date': '14 April 2020',
          'dateObject': new Date('2020-04-14T14:53:26.099'),
          'text': 'You sent your appeal details to the Tribunal.',
          'links': [{
            'title': 'What you sent',
            'text': 'Your appeal details',
            'href': '{{ paths.common.appealDetailsViewer }}'
          }, {
            'title': 'Helpful information',
            'text': 'What is a Tribunal Caseworker?',
            'href': '{{ paths.common.tribunalCaseworker }}'
          }]
        }]
      );
    });

    it('Should construct the appeal hearing requirements section when appellant takes over', () => {
      req.session.appeal.timeExtensionEventsMap = [];
      const appealHearingRequirementsSectionEvents = [
        Events.UPLOAD_ADDITIONAL_EVIDENCE.id,
        Events.UPLOAD_ADDENDUM_EVIDENCE_LEGAL_REP.id
      ];
      const history = [
        {
          'id': 'uploadAdditionalEvidence',
          'createdDate': '2020-04-14T14:53:26.099',
          'user': {
            'id': 'legal-rep'
          }
        },
        {
          'id': 'uploadAddendumEvidenceLegalRep',
          'createdDate': '2020-04-14T14:53:26.099',
          'user': {
            'id': 'legal-rep'
          }
        }
      ] as HistoryEvent[];
      req.session.appeal.history = history;
      const result = constructSection(appealHearingRequirementsSectionEvents, req.session.appeal.history, null, req as Request);

      expect(result).to.deep.eq(
        [{
          'date': '14 April 2020',
          'dateObject': new Date('2020-04-14T14:53:26.099'),
          'text': 'More evidence was provided.',
          'links': [{
            'title': 'What was provided',
            'text': 'Your evidence',
            'href': '{{ paths.common.lrEvidence }}'
          }]
        }, {
          'date': '14 April 2020',
          'dateObject': new Date('2020-04-14T14:53:26.099'),
          'text': 'More evidence was provided.',
          'links': [{
            'title': 'What was provided',
            'text': 'Your evidence',
            'href': '{{ paths.common.yourAddendumEvidence }}'
          }]
        }]
      );
    });
  });

  describe('getApplicationEvents', () => {
    it('should get application events and decision for appellant', () => {
      req.session.appeal.makeAnApplications = [
        {
          id: '1',
          value: {
            applicant: 'Appellant',
            applicantRole: 'citizen',
            date: '2021-07-15',
            decision: 'Pending',
            details: 'my details',
            state: 'awaitingReasonsForAppeal',
            type: 'Time extension',
            evidence: []
          }
        },
        {
          id: '2',
          value: {
            applicant: 'Legal representative',
            applicantRole: 'caseworker-ia-legalrep-solicitor',
            date: '2021-07-10',
            decision: 'Granted',
            decisionDate: '2021-07-12',
            decisionMaker: 'Tribunal Caseworker',
            decisionReason: 'reason why',
            details: 'my details',
            state: 'awaitingReasonsForAppeal',
            type: 'Time extension',
            evidence: []
          }
        }
      ];
      const applicationEvents = getApplicationEvents(req as Request);

      expect(applicationEvents).to.deep.eq(
        [{
          'date': '15 July 2021',
          'dateObject': new Date('2021-07-15T00:00:00.00Z'),
          'text': 'You sent the Tribunal a request.',
          'id': '1',
          'links': [{
            'title': 'What you sent',
            'text': 'Your request',
            'href': '{{ paths.common.makeAnApplicationViewer }}/1'
          }]
        },
        {
          'id': '2',
          'date': '12 July 2021',
          'dateObject': new Date('2021-07-12T00:00:00.00Z'),
          'text': 'Your request was granted.',
          'links': [{
            'title': 'What the Tribunal said',
            'text': 'Reason for decision',
            'href': '{{ paths.common.makeAnApplicationViewer }}/2'
          }]
        },
        {
          'date': '10 July 2021',
          'dateObject': new Date('2021-07-10T00:00:00.00Z'),
          'text': 'You sent the Tribunal a request.',
          'id': '2',
          'links': [{
            'title': 'What you sent',
            'text': 'Your request',
            'href': '{{ paths.common.makeAnApplicationViewer }}/2'
          }]
        }]
      );
    });

    it('should get application events and decision for respondent', () => {
      req.session.appeal.makeAnApplications = [
        {
          id: '4',
          value: {
            applicant: 'Respondent',
            applicantRole: 'caseworker-ia-homeofficeapc',
            date: '2021-07-20',
            decision: 'Refused',
            decisionDate: '2021-07-25',
            decisionMaker: 'Tribunal Caseworker',
            decisionReason: 'reason why',
            details: 'my details',
            state: 'awaitingReasonsForAppeal',
            type: 'Time extension',
            evidence: []
          }
        }
      ];
      const applicationEvents = getApplicationEvents(req as Request);

      expect(applicationEvents).to.deep.eq(
        [{
          'id': '4',
          'date': '25 July 2021',
          'dateObject': new Date('2021-07-25T00:00:00.00Z'),
          'text': 'The Home Office request was refused.',
          'links': [{
            'title': 'What the Tribunal said',
            'text': 'Reason for decision',
            'href': '{{ paths.common.makeAnApplicationViewer }}/4'
          }]
        },
        {
          'date': '20 July 2021',
          'dateObject': new Date('2021-07-20T00:00:00.00Z'),
          'text': 'The Home Office sent the Tribunal a request.',
          'id': '4',
          'links': [{
            'title': 'What the Home Office sent',
            'text': 'The Home Office request',
            'href': '{{ paths.common.makeAnApplicationViewer }}/4'
          }]
        }]
      );
    });

    it('should get application events content for Appellant application', () => {
      req.session.appeal.makeAnApplications = [
        {
          id: '2',
          value: {
            applicant: 'Appellant',
            applicantRole: 'citizen',
            date: '2021-07-15',
            decision: 'Pending',
            details: 'my details',
            state: 'awaitingReasonsForAppeal',
            type: 'Time extension',
            evidence: []
          }
        }
      ];
      const applicationEvents = getApplicationEvents(req as Request);

      expect(applicationEvents).to.deep.eq(
        [{
          'date': '15 July 2021',
          'dateObject': new Date('2021-07-15T00:00:00.00Z'),
          'text': 'You sent the Tribunal a request.',
          'id': '2',
          'links': [{
            'title': 'What you sent',
            'text': 'Your request',
            'href': '{{ paths.common.makeAnApplicationViewer }}/2'
          }]
        }]
      );
    });

    it('should get application events content for Legal Rep application', () => {
      req.session.appeal.makeAnApplications = [
        {
          id: '1',
          value: {
            applicant: 'Legal representative',
            applicantRole: 'caseworker-ia-legalrep-solicitor',
            date: '2021-07-15',
            decision: 'Pending',
            details: 'my details',
            state: 'awaitingReasonsForAppeal',
            type: 'Time extension',
            evidence: []
          }
        }
      ];
      const applicationEvents = getApplicationEvents(req as Request);

      expect(applicationEvents).to.deep.eq(
        [{
          'date': '15 July 2021',
          'dateObject': new Date('2021-07-15T00:00:00.00Z'),
          'text': 'You sent the Tribunal a request.',
          'id': '1',
          'links': [{
            'title': 'What you sent',
            'text': 'Your request',
            'href': '{{ paths.common.makeAnApplicationViewer }}/1'
          }]
        }]
      );
    });

    it('should get application events content for Respondent application', () => {
      req.session.appeal.makeAnApplications = [
        {
          id: '3',
          value: {
            applicant: 'Respondent',
            applicantRole: 'caseworker-ia-homeofficeapc',
            date: '2021-07-20',
            decision: 'Pending',
            details: 'my details',
            state: 'awaitingReasonsForAppeal',
            type: 'Time extension',
            evidence: []
          }
        }
      ];
      const applicationEvents = getApplicationEvents(req as Request);

      expect(applicationEvents).to.deep.eq(
        [{
          'date': '20 July 2021',
          'dateObject': new Date('2021-07-20T00:00:00.00Z'),
          'text': 'The Home Office sent the Tribunal a request.',
          'id': '3',
          'links': [{
            'title': 'What the Home Office sent',
            'text': 'The Home Office request',
            'href': '{{ paths.common.makeAnApplicationViewer }}/3'
          }]
        }]
      );
    });
  });

  describe('getSubmitClarifyingQuestionsEvents', () => {
    const history: Partial<HistoryEvent>[] = [
      {
        id: 'submitClarifyingQuestionAnswers',
        createdDate: '2021-08-25T12:23:08.397683',
        state: {
          id: 'clarifyingQuestionsAnswersSubmitted',
          name: ''
        },
        event: {
          eventName: 'Submit clarifying answers',
          description: ''
        }
      }
    ];
    const directions = [
      {
        id: '0',
        tag: 'requestClarifyingQuestions',
        dateDue: '2021-09-22',
        dateSent: '2021-08-25',
        uniqueId: 'directionId'
      }
    ];
    it('should get Submit CQ events', () => {
      const events = getSubmitClarifyingQuestionsEvents(history as HistoryEvent[], directions as Direction[]);

      expect(events.length).to.be.eql(1);
      expect(events[0]).to.contain.keys('date', 'dateObject', 'text', 'links');
    });

    it('should discard a direction if CQ not yet answered', () => {
      directions.push({
        id: '1',
        tag: 'requestClarifyingQuestions',
        dateDue: '2021-09-22',
        dateSent: '2021-08-25',
        uniqueId: 'directionId'
      });
      const events = getSubmitClarifyingQuestionsEvents(history as HistoryEvent[], directions as Direction[]);

      expect(events.length).to.be.eql(1);
      expect(events[0]).to.contain.keys('date', 'dateObject', 'text', 'links');
    });

    it('should return empty events array', () => {
      const events = getSubmitClarifyingQuestionsEvents([], []);

      expect(events.length).to.be.eql(0);
    });
  });

  describe('getDirectionHistory', () => {
    it('should get direction history', () => {
      req.session.appeal.directions = [
        {
          id: '1',
          parties: 'appellant',
          tag: '',
          dateDue: '2023-12-11',
          dateSent: '2023-05-11',
          explanation: 'explanation 1',
          uniqueId: '123456789',
          directionType: 'sendDirection'
        },
        {
          id: '2',
          parties: 'respondent',
          tag: '',
          dateDue: '2023-12-11',
          dateSent: '2023-05-11',
          explanation: 'explanation 2',
          uniqueId: '987654321',
          directionType: 'sendDirection'
        }
      ];
      const directionsHistory = getDirectionHistory(req as Request);

      expect(directionsHistory.length).to.be.eql(2);
      directionsHistory.forEach(direction => {
        expect(direction).to.contain.keys('date', 'dateObject', 'text', 'links');
      });
    });

    it('should filter history with non sendDirection type and appellant/respondent parties', () => {
      req.session.appeal.directions = [
        {
          id: '1',
          parties: 'appellant',
          tag: '',
          dateDue: '2023-12-11',
          dateSent: '2023-05-11',
          explanation: 'explanation 1',
          uniqueId: '123456789',
          directionType: 'sendDirection'
        },
        {
          id: '2',
          parties: 'respondent',
          tag: '',
          dateDue: '2023-12-11',
          dateSent: '2023-05-11',
          explanation: 'explanation 2',
          uniqueId: '987654321',
          directionType: 'sendDirection'
        },
        {
          id: '3',
          parties: 'appellant',
          tag: 'respondentEvidence',
          dateDue: '2023-12-11',
          dateSent: '2023-05-11',
          explanation: 'explanation 3',
          uniqueId: '159159159',
          directionType: 'requestRespondentEvidence'
        },
        {
          id: '4',
          parties: 'appellant',
          tag: '',
          dateDue: '2023-12-11',
          dateSent: '2023-05-11',
          explanation: 'explanation 4',
          uniqueId: '135135135',
          directionType: 'sendDirection'
        }
      ];
      const directionsHistory = getDirectionHistory(req as Request);
      expect(directionsHistory.length).to.be.eql(3);
      directionsHistory.forEach(direction => {
        expect(direction).to.contain.keys('date', 'dateObject', 'text', 'links');
      });
    });

    it('should return empty direction history', () => {
      req.session.appeal.directions = [];
      const directionsHistory = getDirectionHistory(req as Request);
      expect(directionsHistory.length).to.be.eql(0);
    });
  });

  describe('getEventsAndStates', () => {
    it('should return relevant events and states when uploadAddendumEvidence feature enabled', () => {
      const eventsAndStates = getEventsAndStates(true, true, false);
      expect(eventsAndStates.appealArgumentSectionEvents.length).to.be.eqls(16);
      expect(eventsAndStates.appealArgumentSectionStates.length).to.be.eqls(14);
    });

    it('should return relevant events and states when uploadAddendumEvidence feature disabled', () => {
      const eventsAndStates = getEventsAndStates(false, true, false);
      expect(eventsAndStates.appealArgumentSectionEvents.length).to.be.eqls(12);
      expect(eventsAndStates.appealArgumentSectionStates.length).to.be.eqls(11);
    });

    it('should return relevant events when hearingBundle feature enabled', () => {
      const eventsAndStates = getEventsAndStates(false, true, false);
      expect(eventsAndStates.appealHearingRequirementsSectionEvents.length).to.be.eqls(4);
    });

    it('should return relevant events when hearingBundle and uploadAddendumEvidence features enabled', () => {
      const eventsAndStates = getEventsAndStates(true, true, false);
      expect(eventsAndStates.appealHearingRequirementsSectionEvents.length).to.be.eqls(5);
    });

    it('should return relevant events when hearingBundle feature disabled', () => {
      const eventsAndStates = getEventsAndStates(true, false, false);
      expect(eventsAndStates.appealHearingRequirementsSectionEvents.length).to.be.eqls(4);
    });

    it('should return relevant events when ftpa feature disabled', () => {
      const eventsAndStates = getEventsAndStates(false, false, false);
      expect(eventsAndStates.appealDecisionSectionEvents.length).to.be.eqls(1);
    });

    it('should return relevant events when ftpa feature enabled', () => {
      const eventsAndStates = getEventsAndStates(false, false, true);
      expect(eventsAndStates.appealDecisionSectionEvents.length).to.be.eqls(5);
    });
  });
});
