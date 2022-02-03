import { Request } from 'express';
import { Events } from '../../../app/data/events';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import { constructSection, getSubmitClarifyingQuestionsEvents, getTimeExtensionsEvents } from '../../../app/utils/timeline-utils';
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
          reasonsForAppeal: {}
        }
      },
      idam: {
        userDetails: {
          forename: 'forename',
          surname: 'surname'
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
  });

  describe('getTimeExtensionsEvents', () => {
    it('should get timeExtensions', () => {
      const makeAnApplications: Collection<Application<Evidence>>[] = [
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
        },
        {
          id: '1',
          value: {
            applicant: 'Appellant',
            applicantRole: 'citizen',
            date: '2021-07-10',
            decision: 'Refused',
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
      const timeExtensions = getTimeExtensionsEvents(makeAnApplications);

      expect(timeExtensions.length).to.be.eq(3);
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
});
