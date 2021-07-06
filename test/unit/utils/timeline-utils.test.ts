import { Request } from 'express';
import { Events } from '../../../app/data/events';
import { States } from '../../../app/data/states';
import Logger from '../../../app/utils/logger';
import { constructSection } from '../../../app/utils/timeline-utils';
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
  });

  describe('constructSection', () => {
    it('Should construct the appeal argument section', () => {
      req.session.appeal.timeExtensionEventsMap = [];
      const appealArgumentSection = [ Events.SUBMIT_REASONS_FOR_APPEAL.id, Events.SUBMIT_TIME_EXTENSION.id, Events.REVIEW_TIME_EXTENSION.id ];

      const result = constructSection(appealArgumentSection, expectedEventsWithTimeExtensionsData, [ States.REASONS_FOR_APPEAL_SUBMITTED.id, States.AWAITING_REASONS_FOR_APPEAL.id ], req as Request);
      expect(result).to.deep.eq(
        [ {
          'date': '15 April 2020',
          'text': 'Your request for more time was granted.',
          'links': [ {
            'title': 'What the Tribunal said ',
            'text': 'Reason for decision',
            'href': `${result[0].links[0].href}`
          } ]
        }, {
          'date': '15 April 2020',
          'text': 'You asked for more time.',
          'links': [ {
            'title': 'What you sent',
            'text': 'Reason you needed more time',
            'href': `${result[1].links[0].href}`
          } ]
        }, {
          'date': '14 April 2020',
          'text': 'Your request for more time was refused.',
          'links': [ {
            'title': 'What the Tribunal said ',
            'text': 'Reason for decision',
            'href': `${result[2].links[0].href}`
          } ]
        }, {
          'date': '14 April 2020',
          'text': 'You asked for more time.',
          'links': [ {
            'title': 'What you sent',
            'text': 'Reason you needed more time',
            'href': `${result[3].links[0].href}`
          } ]
        } ]
      );
    });

    it('Should construct the appeal details section', () => {
      req.session.appeal.timeExtensionEventsMap = [];
      const appealDetailsSection = [ Events.SUBMIT_APPEAL.id ];

      const result = constructSection(appealDetailsSection, expectedEventsWithTimeExtensionsData, null, req as Request);
      expect(result).to.deep.eq(
        [ {
          'date': '14 April 2020',
          'text': 'You sent your appeal details to the Tribunal.',
          'links': [ {
            'title': 'What you sent',
            'text': 'Your appeal details',
            'href': '{{ paths.common.appealDetailsViewer }}'
          }, {
            'title': 'Helpful information',
            'text': 'What is a Tribunal Caseworker?',
            'href': '{{ paths.common.tribunalCaseworker }}'
          } ]
        } ]
      );
    });
  });
});
