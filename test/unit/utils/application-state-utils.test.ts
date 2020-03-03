import { Request } from 'express';
import { paths } from '../../../app/paths';
import { getAppealApplicationNextStep } from '../../../app/utils/application-state-utils';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

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
        cta: paths.taskList,
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
          "A Tribunal Caseworker will contact you by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> to tell you what to do next."
        ],

        info: {
          title: 'Helpful Information',
          url: '<a class="govuk-link" href="#">What is a Tribunal Caseworker?</a>'
        }
      });
    });

    it('when application status is reasonsForAppealSubmitted should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'reasonsForAppealSubmitted';
      req.session.appeal.appealCreatedDate = '2020-02-06T16:00:00.000';
      req.session.appeal.appealLastModified = '2020-02-07T16:00:00.000';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        cta: null,
        deadline: undefined,
        descriptionParagraphs: [
          'You have told us why you think the Home Office decision is wrong.',
          'A Tribunal Caseworker will contact you by <span class=\'govuk-body govuk-!-font-weight-bold\'>Date TBC</span> to tell you what to do next.'
        ]
      });
    });
  });
});
