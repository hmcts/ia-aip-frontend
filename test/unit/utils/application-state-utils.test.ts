import { Request } from 'express';
import { AuthenticationService, SecurityHeaders } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { getAppealApplicationHistory, getAppealApplicationNextStep } from '../../../app/utils/application-state-utils';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
import { expectedMultipleEventsData } from '../mockData/events/expectation/expected-multiple-events';

describe('application-state-utils', () => {
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
          application: {}
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

  describe('getAppealApplicationNextStep', () => {
    it('when application status is appealStarted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealStarted';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.equal({
        cta: '/task-list',
        deadline: null,
        descriptionParagraphs: [
          'You need to answer a few questions about yourself and your appeal to get started.',
          'You will need to have your Home Office decision letter with you to answer some questions.'
        ],
        info: {
          title: null,
          url: null
        }
      });
    });

    it('when application status is appealSubmitted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealSubmitted';
      req.session.appeal.appealCreatedDate = '2020-02-06T16:00:00.000';
      req.session.appeal.appealLastModified = '2020-02-07T16:00:00.000';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        cta: null,
        deadline: '21 February 2020',
        descriptionParagraphs: [
          'Your appeal details have been sent to the Tribunal.',
          'A Tribunal Caseworker will contact you by <span  class=\'govuk-body govuk-!-font-weight-bold\'> {{ applicationNextStep.deadline }}</span>  to tell you what to do next.'
        ],

        info: {
          title: 'Helpful Information',
          url: '<a href="#">What is a Tribunal Caseworker?</a>'
        }
      });
    });
  });

});
