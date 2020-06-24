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
          reasonsForAppeal: {},
          directions: [
            {
              'id': 3,
              'tag': 'requestCmaRequirements',
              'dateDue': '2020-05-21',
              'dateSent': '2020-05-02'
            },
            {
              'id': 2,
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-01',
              'dateSent': '2020-04-21'
            },
            {
              'id': 1,
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'dateSent': '2020-04-14'
            }
          ],
          history: [
            {
              'id': 'submitAppeal',
              'createdDate': '2020-02-08T16:00:00.000'
            },
            {
              'id': 'submitReasonsForAppeal',
              'createdDate': '2020-02-18T16:00:00.000'
            }
          ]
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
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql(
        {
          deadline: 'TBC',
          descriptionParagraphs: [
            'Description for appeal status <b>unknown</b> not found'
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
        info: null,
        allowedAskForMoreTime: false
      });
    });

    it('when application status is appealSubmitted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealSubmitted';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        cta: null,
        deadline: '07 March 2020',
        descriptionParagraphs: [
          'Your appeal details have been sent to the Tribunal.',
          'A Tribunal Caseworker will contact you to tell you what to do next. This should be by <span class=\'govuk-body govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.'
        ],
        info: {
          title: 'Helpful Information',
          url: "<a href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        },
        allowedAskForMoreTime: false
      });
    });

    it('when application status is awaitingReasonsForAppeal should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
      req.session.appeal.directions = [
        {
          'id': '2',
          'tag': 'requestReasonsForAppeal',
          'parties': 'appellant',
          'dateDue': '2020-09-01',
          'dateSent': '2020-04-21',
          'explanation': 'direction explanation'
        },
        {
          'id': '1',
          'tag': 'respondentEvidence',
          'parties': 'respondent',
          'dateDue': '2020-04-28',
          'dateSent': '2020-04-14',
          'explanation': 'direction explanation'
        }
      ];
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql(
        {
          allowedAskForMoreTime: true,
          cta: {
            respondByText: 'You need to respond by {{ applicationNextStep.deadline }}.',
            respondByTextAskForMoreTime: 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
            url: '/case-building/home-office-decision-wrong'
          },
          deadline: '01 September 2020',
          descriptionParagraphs: [
            'Tell us why you think the Home Office decision to refuse your claim is wrong.'
          ],
          descriptionParagraphsAskForMoreTime: [
            'You might not get more time. You should still try to tell us why you think the Home Office decision is wrong by <span class=\"govuk-!-font-weight-bold\">{{ applicationNextStep.deadline }}</span> if you can.'
          ],
          info: {
            title: 'Helpful Information',
            url: "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
          },
          usefulDocuments: {
            title: 'Useful documents',
            url: "<a href='{{ paths.common.detailsViewers.homeOfficeDocuments }}'>Home Office documents about your case</a>"
          }
        }
      );
    });
  });

  it('when application status is awaitingReasonsForAppeal and it\'s partially completed should get correct \'Do This next section\'', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.reasonsForAppeal.applicationReason = 'A text description of why I decided to appeal';
    req.session.appeal.directions = [
      {
        id: '2',
        tag: 'requestReasonsForAppeal',
        parties: 'appellant',
        dateDue: '2020-04-21',
        dateSent: '2020-03-24',
        explanation: 'direction explanation'
      },
      {
        id: '1',
        tag: 'respondentEvidence',
        parties: 'respondent',
        dateDue: '2020-04-07',
        dateSent: '2020-03-24',
        explanation: 'direction explanation'
      } ];
    const result = getAppealApplicationNextStep(req as Request);

    expect(result).to.eql(
      {
        cta: {
          respondByText: 'You need to respond by {{ applicationNextStep.deadline }}.',
          'respondByTextAskForMoreTime': 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
          url: '/case-building/home-office-decision-wrong'
        },
        deadline: '21 April 2020',
        descriptionParagraphs: [
          'You need to finish telling us why you think the Home Office decision to refuse your claim is wrong.'
        ],
        'descriptionParagraphsAskForMoreTime': [
          'You might not get more time. You need to finish telling us why you think the Home Office decision is wrong by <span class=\"govuk-!-font-weight-bold\">{{ applicationNextStep.deadline }}</span> if you can.'
        ],
        info: {
          title: 'Helpful Information',
          url: "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
        },
        usefulDocuments: {
          title: 'Useful documents',
          url: "<a href='{{ paths.common.detailsViewers.homeOfficeDocuments }}'>Home Office documents about your case</a>"
        },
        allowedAskForMoreTime: true
      }
    );
  });

  it('when application status is reasonsForAppealSubmitted should get correct Do this next section.', () => {
    req.session.appeal.appealStatus = 'reasonsForAppealSubmitted';

    const result = getAppealApplicationNextStep(req as Request);

    expect(result).to.eql({
      cta: null,
      deadline: '03 March 2020',
      descriptionParagraphs: [
        'You have told us why you think the Home Office decision is wrong.',
        'A Tribunal Caseworker will contact you to tell you what to do next. This should be by <span class=\'govuk-body govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span> but it may take longer than that.'
      ],
      allowedAskForMoreTime: false
    });
  });

  it('when application status is awaitingCmaRequirements should get correct Do this next section.', () => {
    req.session.appeal.appealStatus = 'awaitingCmaRequirements';

    const result = getAppealApplicationNextStep(req as Request);

    expect(result).to.eql(
      {
        allowedAskForMoreTime: true,
        cta: {
          respondByText: 'You need to respond by {{ applicationNextStep.deadline }}.',
          respondByTextAskForMoreTime: 'It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later.',
          url: '/appointment-needs'
        },
        deadline: '21 May 2020',
        descriptionParagraphs: [
          'You need to attend a case management appointment.',
          'First, tell us if you will need anything at the appointment, like an interpreter or step-free access.'
        ],
        descriptionParagraphsAskForMoreTime: [
          'You might not get more time. You should still try to tell us why you think the Home Office decision is wrong by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> if you can.'
        ],
        info: {
          title: 'Helpful Information',
          url: "<a href='{{ paths.common.homeOfficeDocuments }}'>What to expect at a case management appointment</a>"
        }
      }
    );
  });
});
