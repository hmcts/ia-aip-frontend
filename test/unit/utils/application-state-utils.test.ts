import { Request } from 'express';
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

  describe('getAppealApplicationNextStep', () => {
    it('when application status is unknown should return default \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'unknown';
      req.session.lastModified = '2020-02-07T16:00:00.000';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql(
        {
          deadline: 'TBC',
          descriptionParagraphs: [
            'Description for event <b>unknown</b> not found'
          ]
        }
      );
    });

    it('when application status is appealStarted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealStarted';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.equal({
        cta: {
          respondByText: null,
          url: '/about-appeal'
        },
        deadline: null,
        descriptionParagraphs: [
          'You need to answer a few questions about yourself and your appeal to get started.',
          'You will need to have your Home Office decision letter with you to answer some questions.'
        ],
        info: null
      });
    });

    it('when application status is appealSubmitted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealSubmitted';
      req.session.appeal.appealCreatedDate = '2020-02-06T16:00:00.000';
      req.session.appeal.appealLastModified = '2020-02-07T16:00:00.000';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        cta: null,
        deadline: '06 March 2020',
        descriptionParagraphs: [
          'Your appeal details have been sent to the Tribunal.',
          'A Tribunal Caseworker will contact you to tell you what to do next. This should be by {{ applicationNextStep.deadline }} but it might take longer than that.'
        ],

        info: {
          title: 'Helpful Information',
          url: '<a class=\'govuk-link\' href=\'/tribunal-caseworker\'>What is a Tribunal Caseworker?</a>'
        }
      });
    });

    it('when application status is awaitingReasonsForAppeal should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
      req.session.lastModified = '2020-02-07T16:00:00.000';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql(
        {
          cta: {
            respondByText: 'You need to respond by {{ applicationNextStep.deadline }}.',
            url: '/case-building/home-office-decision-wrong'
          },
          deadline: 'TBC',
          descriptionParagraphs: [
            'Tell us why you think the Home Office decision to refuse your claim is wrong.'
          ],
          info: {
            title: 'Helpful Information',
            url: '<a href="#">Understanding your Home Office documents</a>'
          },
          usefulDocuments: {
            title: 'Useful documents',
            url: "<a href='{{ paths.detailsViewers.homeOfficeDocuments }}'>Home Office documents about your case</a>"
          }
        }
      );
    });
  });

  it('when application status is awaitingReasonsForAppeal and it\'s partially completed should get correct \'Do This next section\'', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.lastModified = '2020-02-07T16:00:00.000';
    req.session.appeal.reasonsForAppeal.applicationReason = 'A text description of why I decided to appeal';
    const result = getAppealApplicationNextStep(req as Request);

    expect(result).to.eql(
      {
        cta: {
          respondByText: 'You need to respond by {{ applicationNextStep.deadline }}.',
          url: '/case-building/home-office-decision-wrong'
        },
        deadline: 'TBC',
        descriptionParagraphs: [
          'You need to finish telling us why you think the Home Office decision to refuse your claim is wrong.'
        ],
        info: {
          title: 'Helpful Information',
          url: '<a href="#">Understanding your Home Office documents</a>'
        },
        usefulDocuments: {
          title: 'Useful documents',
          url: "<a href='{{ paths.detailsViewers.homeOfficeDocuments }}'>Home Office documents about your case</a>"
        }
      }
    );
  });

  it('when application status is reasonsForAppealSubmitted should get correct Do this next section.', () => {
    req.session.appeal.appealStatus = 'reasonsForAppealSubmitted';
    req.session.appeal.appealCreatedDate = '2020-02-06T16:00:00.000';
    req.session.appeal.appealLastModified = '2020-02-07T16:00:00.000';

    const result = getAppealApplicationNextStep(req as Request);

    expect(result).to.eql({
      cta: null,
      deadline: 'TBC',
      descriptionParagraphs: [
        'You have told us why you think the Home Office decision is wrong.',
        'A Tribunal Caseworker will contact you by <span class=\'govuk-!-font-weight-bold\'>Date TBC</span> to tell you what to do next.'
      ]
    });
  });
});
