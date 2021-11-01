import { Request } from 'express';
import { Events } from '../../../app/data/events';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import { constructSection, getTimeExtensionsEvents } from '../../../app/utils/timeline-utils';
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

  describe('getTimeExtensionsEvents @timeExtensions', () => {
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
});
