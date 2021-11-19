import { Request } from 'express';
import { paths } from '../../../app/paths';
import {
  getAppealApplicationNextStep,
  getAppealStatus,
  getMoveAppealOfflineDate,
  getMoveAppealOfflineReason
} from '../../../app/utils/application-state-utils';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
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
          hearing: {
            'hearingCentre': 'taylorHouse',
            'time': '90',
            'date': '2020-08-11T10:00:01.000'
          },
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
            },
            {
              'id': 'submitCmaRequirements',
              'createdDate': '2020-02-23T16:00:00.000'
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
    it('should return default when application status is unknown', () => {
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

    it('should return \'Do This next section\' when application status is appealStarted', () => {
      req.session.appeal.appealStatus = 'appealStarted';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.equal({
        cta: {
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

    it('should return \'Do This next section\' when application status is appealStartedPartial', () => {
      req.session.appeal.appealStatus = 'appealStarted';
      req.session.appeal.application.homeOfficeRefNumber = '12345678';

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.equal({
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions,
          i18n.pages.overviewPage.doThisNext.appealStarted.needHomeOfficeDecision
        ],
        info: null,
        cta: {
          url: paths.appealStarted.taskList
        },
        deadline: null,
        allowedAskForMoreTime: false
      });
    });

    it('when application status is appealSubmitted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealSubmitted';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        cta: null,
        deadline: '13 February 2020',
        descriptionParagraphs: [
          'Your appeal details have been sent to the Tribunal.',
          'A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class=\'govuk-body govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span> but it might take longer than that.'
        ],
        info: {
          title: 'Helpful Information',
          url: "<a class='govuk-link' href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        },
        allowedAskForMoreTime: false
      });
    });

    it('when application status is lateAppealSubmitted should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealSubmitted';
      req.session.appeal.application.isAppealLate = true;
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        'allowedAskForMoreTime': false,
        'cta': null,
        'deadline': '13 February 2020',
        'descriptionParagraphs': [
          'Your late appeal details have been sent to the Tribunal.',
          "A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class='govuk-body govuk-!-font-weight-bold'>{{ applicationNextStep.deadline }}</span> but it might take longer than that."
        ],
        'info': {
          'title': 'Helpful Information',
          'url': "<a class='govuk-link' href='{{ paths.common.tribunalCaseworker }}'>What is a Tribunal Caseworker?</a>"
        }
      });
    });

    it('when application status is awaitingRespondentEvidence should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'awaitingRespondentEvidence';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        'allowedAskForMoreTime': false,
        'cta': null,
        'deadline': '13 February 2020',
        'descriptionParagraphs': [
          i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.detailsSent,
          i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.dueDate
        ],
        'info': {
          title: i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.info.title,
          url: i18n.pages.overviewPage.doThisNext.awaitingRespondentEvidence.info.url
        }
      });
    });

    it('when application status is lateAppealRejected should get correct \'Do This next section\'', () => {
      req.session.appeal.appealStatus = 'appealStarted';
      req.session.appeal.outOfTimeDecisionType = 'rejected';
      req.session.appeal.application.isAppealLate = true;

      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        'allowedAskForMoreTime': false,
        'cta': {
          url: null,
          respondByText: null
        },
        'deadline': 'TBC',
        'descriptionParagraphs': [
          "Your appeal cannot continue. Read the <a href='{{ paths.common.outOfTimeDecisionViewer }}'>reasons for this decision</a>.",
          'If you do not contact the Tribunal within 14 days of the decision, a Tribunal Caseworker will end the appeal.'
        ]
      });
    });

    describe('awaitingReasonsForAppeal', () => {
      beforeEach(() => {
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
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppeal and no pending time extension', () => {
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            allowedAskForMoreTime: true,
            cta: {
              respondBy: 'You need to respond by <span class=\'govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span>.',
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '01 September 2020',
            descriptionParagraphs: [
              'Tell us why you think the Home Office decision to refuse your claim is wrong.'
            ],
            info: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.url
            },
            usefulDocuments: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.url
            }
          }
        );
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppeal and a pending time extension', () => {
        const timeExtensionApplication: Collection<Partial<Application<Evidence>>> = {
          value: {
            decision: 'Pending'
          }
        };
        req.session.appeal.makeAnApplications = [ timeExtensionApplication as Collection<Application<Evidence>> ];
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            allowedAskForMoreTime: true,
            cta: {
              respondBy: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.respondByTextAskForMoreTime,
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '01 September 2020',
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.descriptionAskForMoreTime
            ],
            info: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.url
            },
            usefulDocuments: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.url
            }
          }
        );
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppeal and a granted time extension', () => {
        const timeExtensionApplication: Collection<Partial<Application<Evidence>>> = {
          value: {
            decision: 'Granted'
          }
        };
        req.session.appeal.makeAnApplications = [ timeExtensionApplication as Collection<Application<Evidence>> ];
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            allowedAskForMoreTime: true,
            cta: {
              respondBy: i18n.pages.overviewPage.doThisNext.nowRespondBy,
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '01 September 2020',
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.description
            ],
            info: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.url
            },
            usefulDocuments: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.url
            }
          }
        );
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppeal and a refused time extension', () => {
        const timeExtensionApplication: Collection<Partial<Application<Evidence>>> = {
          value: {
            decision: 'Refused'
          }
        };
        req.session.appeal.makeAnApplications = [ timeExtensionApplication as Collection<Application<Evidence>> ];
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            allowedAskForMoreTime: true,
            cta: {
              respondBy: i18n.pages.overviewPage.doThisNext.stillRespondBy,
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '01 September 2020',
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.description
            ],
            info: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.info.url
            },
            usefulDocuments: {
              title: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.title,
              url: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.usefulDocuments.url
            }
          }
        );
      });

    });

    describe('awaitingReasonsForAppeal', () => {
      beforeEach(() => {
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
          }
        ];
        req.session.appeal.makeAnApplications = null;
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppealPartial', () => {
        req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
        req.session.appeal.reasonsForAppeal.applicationReason = 'A text description of why I decided to appeal';
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            cta: {
              respondBy: 'You need to respond by <span class=\'govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span>.',
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '21 April 2020',
            descriptionParagraphs: [
              'You need to finish telling us why you think the Home Office decision to refuse your claim is wrong.'
            ],
            info: {
              title: 'Helpful Information',
              url: "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
            },
            usefulDocuments: {
              title: 'Useful documents',
              url: "<a href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about your case</a>"
            },
            allowedAskForMoreTime: true
          }
        );
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppealPartial and pending time extension', () => {
        const timeExtensionApplication: Collection<Partial<Application<Evidence>>> = {
          value: {
            decision: 'Pending'
          }
        };
        req.session.appeal.makeAnApplications = [ timeExtensionApplication as Collection<Application<Evidence>> ];
        req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
        req.session.appeal.reasonsForAppeal.applicationReason = 'A text description of why I decided to appeal';
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            cta: {
              respondBy: i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.respondByTextAskForMoreTime,
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '21 April 2020',
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.descriptionAskForMoreTime
            ],
            info: {
              title: 'Helpful Information',
              url: "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
            },
            usefulDocuments: {
              title: 'Useful documents',
              url: "<a href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about your case</a>"
            },
            allowedAskForMoreTime: true
          }
        );
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppealPartial and granted time extension', () => {
        const timeExtensionApplication: Collection<Partial<Application<Evidence>>> = {
          value: {
            decision: 'Granted'
          }
        };
        req.session.appeal.makeAnApplications = [ timeExtensionApplication as Collection<Application<Evidence>> ];
        req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
        req.session.appeal.reasonsForAppeal.applicationReason = 'A text description of why I decided to appeal';
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            cta: {
              respondBy: i18n.pages.overviewPage.doThisNext.nowRespondBy,
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '21 April 2020',
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description
            ],
            info: {
              title: 'Helpful Information',
              url: "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
            },
            usefulDocuments: {
              title: 'Useful documents',
              url: "<a href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about your case</a>"
            },
            allowedAskForMoreTime: true
          }
        );
      });

      it('should return \'Do This next section\' when application status is awaitingReasonsForAppealPartial and refused time extension', () => {
        const timeExtensionApplication: Collection<Partial<Application<Evidence>>> = {
          value: {
            decision: 'Refused'
          }
        };
        req.session.appeal.makeAnApplications = [ timeExtensionApplication as Collection<Application<Evidence>> ];
        req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
        req.session.appeal.reasonsForAppeal.applicationReason = 'A text description of why I decided to appeal';
        const result = getAppealApplicationNextStep(req as Request);

        expect(result).to.eql(
          {
            cta: {
              respondBy: i18n.pages.overviewPage.doThisNext.stillRespondBy,
              url: '/case-building/home-office-decision-wrong'
            },
            deadline: '21 April 2020',
            descriptionParagraphs: [
              i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description
            ],
            info: {
              title: 'Helpful Information',
              url: "<a href='{{ paths.common.homeOfficeDocuments }}'>Understanding your Home Office documents</a>"
            },
            usefulDocuments: {
              title: 'Useful documents',
              url: "<a href='{{ paths.common.homeOfficeDocumentsViewer }}'>Home Office documents about your case</a>"
            },
            allowedAskForMoreTime: true
          }
        );
      });
    });

    it('when application status is reasonsForAppealSubmitted should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'reasonsForAppealSubmitted';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        cta: null,
        deadline: '03 March 2020',
        descriptionParagraphs: [
          'You have told us why you think the Home Office decision is wrong.',
          'A Tribunal Caseworker will contact you to tell you what happens next. This should be by <span class=\'govuk-body govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span> but it may take longer than that.'
        ],
        allowedAskForMoreTime: false
      });
    });

    it('should return \'Do This next section\' when application status is respondentReview', () => {
      req.session.appeal.appealStatus = 'respondentReview';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.respondentReview.detailsSent,
          i18n.pages.overviewPage.doThisNext.respondentReview.dueDate
        ],
        info: i18n.pages.overviewPage.doThisNext.respondentReview.info,
        deadline: null
      });
    });

    it('should return \'Do This next section\' when application status is decisionWithdrawn', () => {
      req.session.appeal.appealStatus = 'decisionWithdrawn';
      const result = getAppealApplicationNextStep(req as Request);

      const expected = {
        descriptionParagraphs: [
          i18n.pages.overviewPage.doThisNext.decisionWithdrawn.detailsSent,
          i18n.pages.overviewPage.doThisNext.decisionWithdrawn.dueDate
        ],
        info: i18n.pages.overviewPage.doThisNext.decisionWithdrawn.info,
        deadline: null,
        cta: {},
        hearingCentreEmail: 'IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL'
      };

      expect(result).to.eql(expected);
    });

    it('when application status is awaitingClarifyingQuestionsAnswers should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'awaitingClarifyingQuestionsAnswers';
      const result = getAppealApplicationNextStep(req as Request);

      const expected = {
        'allowedAskForMoreTime': true,
        'cta': {
          'respondBy': 'You need to respond by <span class=\'govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span>.',
          'url': '/questions-about-appeal'
        },
        'deadline': null,
        'descriptionParagraphs': [
          'You need to answer some questions about your appeal.'
        ],
        'info': null
      };

      expect(result).to.eql(expected);
    });

    it('when application status is clarifyingQuestionsAnswersSubmitted should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'clarifyingQuestionsAnswersSubmitted';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql({
        'allowedAskForMoreTime': false,
        'cta': null,
        'deadline': null,
        'descriptionParagraphs': [
          'A Tribunal Caseworker is looking at your answers and will contact you to tell you what to do next.',
          'This should be by <b>{{ applicationNextStep.deadline }}</b> but it might take longer than that.'
        ]
      });
    });

    it('when application status is awaitingCmaRequirements should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'awaitingCmaRequirements';
      const result = getAppealApplicationNextStep(req as Request);

      const expected = {
        allowedAskForMoreTime: true,
        cta: {
          respondBy: 'You need to respond by <span class=\'govuk-!-font-weight-bold\'>{{ applicationNextStep.deadline }}</span>.',
          url: '/appointment-needs'
        },
        deadline: '21 May 2020',
        descriptionParagraphs: [
          'You need to attend a case management appointment.',
          'First, tell us if you will need anything at the appointment, like an interpreter or step-free access.'
        ],
        info: {
          title: 'Helpful Information',
          url: "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        }
      };

      expect(result).to.eql(expected);
    });

    it('when application status is cmaRequirementsSubmitted should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'cmaRequirementsSubmitted';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql(
        {
          'allowedAskForMoreTime': false,
          'cta': null,
          'deadline': '08 March 2020',
          'descriptionParagraphs': [
            'A Tribunal Caseworker is looking at your answers and will contact you with details of your case management appointment and tell you what to do next.',
            'This should be by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> but may be longer than that.'
          ],
          'info': {
            'title': 'Helpful Information',
            'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
          }
        }
      );
    });

    it('when application status is cmaAdjustmentsAgreed should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'cmaAdjustmentsAgreed';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.eql(
        {
          'allowedAskForMoreTime': false,
          'cta': null,
          'deadline': '08 March 2020',
          'descriptionParagraphs': [
            'A Tribunal Caseworker is looking at your answers and will contact you with details of your case management appointment and tell you what to do next.',
            'This should be by <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> but may be longer than that.'
          ],
          'info': {
            'title': 'Helpful Information',
            'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
          }
        }
      );
    });

    it('when application status is awaitingCmaRequirements should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'cmaListed';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.include(
        {
          'allowedAskForMoreTime': false,
          'date': '11 August 2020',
          'deadline': 'TBC',
          descriptionParagraphs: [
            'The Tribunal has set a date for your case management appointment. Here are the details:',
            '<span class="govuk-!-font-weight-bold">Date:</span> {{ applicationNextStep.date }}',
            '<span class="govuk-!-font-weight-bold">Time:</span> {{ applicationNextStep.time }}',
            '<span class="govuk-!-font-weight-bold">Hearing Centre:</span> {{ applicationNextStep.hearingCentre }}',
            'You should read your Notice of Case Management Appointment carefully. It has important information about your appointment.'
          ],
          'hearingCentre': 'Taylor House',
          'info': {
            'title': 'Helpful Information',
            'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
          },
          'time': '10:00 am',
          'usefulDocuments': {
            'title': 'Useful documents',
            'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>Notice of Case Management Appointment.pdf</a>"
          }
        }
      );
    });

    it('when application status is cmaListed should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'cmaListed';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.include(
        {
          'allowedAskForMoreTime': false,
          'date': '11 August 2020',
          'deadline': 'TBC',
          descriptionParagraphs: [
            'The Tribunal has set a date for your case management appointment. Here are the details:',
            '<span class="govuk-!-font-weight-bold">Date:</span> {{ applicationNextStep.date }}',
            '<span class="govuk-!-font-weight-bold">Time:</span> {{ applicationNextStep.time }}',
            '<span class="govuk-!-font-weight-bold">Hearing Centre:</span> {{ applicationNextStep.hearingCentre }}',
            'You should read your Notice of Case Management Appointment carefully. It has important information about your appointment.'
          ],
          'hearingCentre': 'Taylor House',
          'info': {
            'title': 'Helpful Information',
            'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
          },
          'time': '10:00 am',
          'usefulDocuments': {
            'title': 'Useful documents',
            'url': "<a href='{{ paths.common.whatToExpectAtCMA }}'>Notice of Case Management Appointment.pdf</a>"
          }
        }
      );
    });

    it('when application status is appealTakenOffline should get correct Do this next section.', () => {
      req.session.appeal.appealStatus = 'appealTakenOffline';
      req.session.appeal.removeAppealFromOnlineReason = 'Reason to move an appeal offline';
      req.session.appeal.removeAppealFromOnlineDate = '2021-06-30';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.include(
        {
          descriptionParagraphs: [
          ],
          'info': {
            'title': 'What happens next',
            'url': 'Your appeal will continue offline. The Tribunal will contact you soon to tell you what will happen next.'
          }
        }
      );
    });

    it('when application status is ended should get the correct Do this next section. @ended', () => {
      req.session.appeal.appealStatus = 'ended';
      const result = getAppealApplicationNextStep(req as Request);

      expect(result).to.deep.include(
        {
          'allowedAskForMoreTime': false,
          'deadline': 'TBC',
          descriptionParagraphs: [
            'Review your <a href=\"{{ paths.common.noticeEndedAppealViewer }}\">Notice of Ended Appeal</a>. This includes details of who ended the appeal and why.',
            'If a Tribunal Caseworker ended the appeal and you disagree with this decision, you have 14 days to ask for the decision to be reviewed by a judge.',
            'You can do this by emailing <a href=\"mailto:{{ applicationNextStep.hearingCentreEmail }}\">{{ applicationNextStep.hearingCentreEmail }}</a>. Please include your Appeal reference in the subject line of the email.',
            '<h3 class=\"govuk-heading-s govuk-!-margin-bottom-0\">Tell us what you think</h3>',
            '<a href=\"https://www.smartsurvey.co.uk/s/AiPImmigrationAsylum_Exit/\" target=\"_blank\">Take a short survey about this service (opens in a new window)</a>.'
          ],
          cta: {
            url: null,
            ctaTitle: 'Your appeal has now ended'
          },
          hearingCentreEmail: 'IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL'
        }
      );
    });
  });

  it('when application status is appealSubmitted and appeal is late, status should be lateAppealSubmitted.', () => {
    req.session.appeal.appealStatus = 'appealSubmitted';
    req.session.appeal.application.isAppealLate = true;

    const result = getAppealStatus(req as Request);

    expect(result).to.eql('lateAppealSubmitted');
  });

  it('when application status is appealSubmitted and appeal is not late, status should be appealSubmitted.', () => {
    req.session.appeal.appealStatus = 'appealSubmitted';
    req.session.appeal.application.isAppealLate = false;

    const result = getAppealStatus(req as Request);

    expect(result).to.eql('appealSubmitted');
  });

  it('when application status is appealTakenOffline and removeAppealFromOnlineReason and date can be read.', () => {
    req.session.appeal.removeAppealFromOnlineReason = 'Reason to move an appeal offline';
    req.session.appeal.removeAppealFromOnlineDate = '2021-06-30';
    req.session.appeal.application.isAppealLate = false;

    const result = getMoveAppealOfflineReason(req as Request);
    const offlineDate = getMoveAppealOfflineDate(req as Request);

    expect(result).to.eql('Reason to move an appeal offline');
    expect(offlineDate).to.eql('2021-06-30');
  });

  it('when application has not ended and outOfTimeDecisionType is rejected and appeal is late status, should be lateAppealRejected.', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.outOfTimeDecisionType = 'rejected';
    req.session.appeal.application.isAppealLate = true;

    const result = getAppealStatus(req as Request);

    expect(result).to.eql('lateAppealRejected');
  });

  it('when application has ended and outOfTimeDecisionType is rejected and appeal is late status, should be ended.', () => {
    req.session.appeal.appealStatus = 'ended';
    req.session.appeal.outOfTimeDecisionType = 'rejected';
    req.session.appeal.application.isAppealLate = true;

    const result = getAppealStatus(req as Request);

    expect(result).to.eql('ended');
  });

  it('when application hasn\'t ended and isAppealLate.', () => {
    req.session.appeal.appealStatus = 'notEnded';
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.outOfTimeDecisionType = 'rejected';
    const result = getAppealStatus(req as Request);

    expect(result).to.eql('lateAppealRejected');
  });

  it('when application hasn\'t ended and appealStatus === appealSubmitted.', () => {
    req.session.appeal.appealStatus = 'appealSubmitted';
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.outOfTimeDecisionType = 'approved';
    const result = getAppealStatus(req as Request);

    expect(result).to.eql('lateAppealSubmitted');
  });

  it('when application hasn\'t ended and appealStatus !== appealSubmitted.', () => {
    req.session.appeal.appealStatus = 'aappealSubmitted';
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.outOfTimeDecisionType = 'approved';
    const result = getAppealStatus(req as Request);

    expect(result).to.eql('aappealSubmitted');
  });

});
