import express, { NextFunction, Request, Response } from 'express';
import {
  getCheckAndSendPage,
  postCheckAndSendPage,
  setupCmaRequirementsCYAController
} from '../../../../../app/controllers/cma-requirements/check-and-send/check-and-send';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements Check and Send controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  const cmaRequirements: CmaRequirements = {
    'accessNeeds': {
      'isInterpreterServicesNeeded': true,
      'interpreterLanguage': {
        'language': 'Afar',
        'languageDialect': 'A dialect'
      },
      'isHearingRoomNeeded': true,
      'isHearingLoopNeeded': true
    },
    'otherNeeds': {
      'multimediaEvidence': true,
      'bringOwnMultimediaEquipment': false,
      'bringOwnMultimediaEquipmentReason': 'Reason for "Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it"',
      'singleSexAppointment': true,
      'singleSexTypeAppointment': 'All male',
      'singleSexAppointmentReason': 'Reason for "Tell us why you need an all-male appointment"',
      'privateAppointment': true,
      'privateAppointmentReason': 'Reason for "Tell us why you need a private appointment"',
      'healthConditions': true,
      'healthConditionsReason': 'Reason for "Tell us how any physical or mental health conditions you have may affect you at the appointment"',
      'pastExperiences': true,
      'pastExperiencesReason': 'Reason for "Tell us how any past experiences that may affect you at the appointment"',
      'anythingElse': true,
      'anythingElseReason': 'Reason for "Tell us what you will need and why you need it"'
    },
    'datesToAvoid': {
      'isDateCannotAttend': true,
      'dates': [
        {
          'date': {
            'day': '08',
            'month': '07',
            'year': '2020'
          },
          'reason': 'Reason 1 for "Why can you not go to the appointment on this date?"'
        },
        {
          'date': {
            'day': '09',
            'month': '07',
            'year': '2020'
          },
          'reason': 'Reason 2  for "Why can you not go to the appointment on this date?:'
        }
      ]
    }
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          cmaRequirements: JSON.parse(JSON.stringify(cmaRequirements))
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub().returns({ state: 'cmaRequirementsSubmitted' }) } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCmaRequirementsCYAController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupCmaRequirementsCYAController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.checkAndSend);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.checkAndSend);
    });
  });

  describe('getCheckAndSendPage', () => {
    it('should render CYA template page', () => {
      getCheckAndSendPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk');
    });

    it('should render CYA template page with requirements', () => {

      const expectedArgs = {
        formAction: '/appointment-check-answers',
        pageTitle: 'Check your answers',
        previousPage: '/appointment-needs',
        summarySections: [ {
          title: '1. Access needs',
          summaryLists: [ {
            title: 'Interpreter',
            summaryRows: [ { key: { text: 'Question' }, value: { html: 'Will you need an interpreter?' } }, {
              actions: { items: [ { href: '/appointment-interpreter?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              actions: { items: [ { href: '/appointment-add-language-details?edit', text: 'Change' } ] },
              key: { text: 'Language' },
              value: { html: 'Afar' }
            }, {
              actions: { items: [ { href: '/appointment-add-language-details?edit', text: 'Change' } ] },
              key: { text: 'Dialect' },
              value: { html: 'A dialect' }
            } ]
          }, {
            title: 'Step-free access',
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Will you or anyone coming with you need step-free access?' }
            }, {
              actions: { items: [ { href: '/appointment-step-free-access?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            } ]
          }, {
            title: 'Hearing loop',
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Will you or anyone coming with you need a hearing loop?' }
            }, {
              actions: { items: [ { href: '/appointment-hearing-loop?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            } ]
          } ]
        }, {
          title: '2. Other needs',
          summaryLists: [ {
            title: 'Multimedia evidence',
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Will you bring any multimedia evidence?' }
            }, {
              actions: { items: [ { href: '/appointment-multimedia-evidence?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              key: { text: 'Question' },
              value: { html: 'Will you bring the equipment to play this evidence?' }
            }, {
              actions: {
                items: [ { href: '/appointment-multimedia-evidence-equipment?edit', text: 'Change' } ]
              },
              key: { text: 'Answer' },
              value: { html: 'No' }
            }, {
              key: { text: 'Question' },
              value: {
                html: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it'
              }
            }, {
              actions: {
                items: [ { href: '/appointment-multimedia-evidence-equipment-reasons?edit', text: 'Change' } ]
              },
              key: { text: 'Answer' },
              value: {
                html: '<pre>Reason for "Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it"</pre>'
              }
            } ]
          }, {
            title: 'All-female or all-male appointment',
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Will you need an all-female or all-male appointment?' }
            }, {
              actions: { items: [ { href: '/appointment-single-sex?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              key: { text: 'Question' },
              value: { html: 'What type of appointment will you need?' }
            }, {
              actions: { items: [ { href: '/appointment-single-sex-type?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'All male' }
            }, {
              key: { text: 'Question' },
              value: { html: 'Tell us why you need an all-male appointment' }
            }, {
              actions: { items: [ { href: '/appointment-single-sex-type-male?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: {
                html: '<pre>Reason for "Tell us why you need an all-male appointment"</pre>'
              }
            } ]
          }, {
            title: 'Private appointment',
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Will you need a private appointment?' }
            }, {
              actions: { items: [ { href: '/appointment-private?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              key: { text: 'Question' },
              value: { html: 'Tell us why you need a private appointment' }
            }, {
              actions: { items: [ { href: '/appointment-private-reasons?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: '<pre>Reason for "Tell us why you need a private appointment"</pre>' }
            } ]
          }, {
            title: 'Physical or mental health conditions',
            summaryRows: [ {
              key: { text: 'Question' },
              value: {
                html: 'Do you have any physical or mental health conditions that may affect you at the appointment?'
              }
            }, {
              actions: {
                items: [ { href: '/appointment-physical-mental-health?edit', text: 'Change' } ]
              },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              key: { text: 'Question' },
              value: {
                html: 'Tell us how any physical or mental health conditions you have may affect you at the appointment'
              }
            }, {
              actions: {
                items: [ { href: '/appointment-physical-mental-health-reasons?edit', text: 'Change' } ]
              },
              key: { text: 'Answer' },
              value: {
                html: '<pre>Reason for "Tell us how any physical or mental health conditions you have may affect you at the appointment"</pre>'
              }
            } ]
          }, {
            title: 'Past experiences',
            summaryRows: [ {
              key: { text: 'Question' },
              value: {
                html: 'Have you had any past experiences that may affect you at the appointment?'
              }
            }, {
              actions: { items: [ { href: '/appointment-past-experiences?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              key: { text: 'Question' },
              value: {
                html: 'Tell us how any past experiences that may affect you at the appointment'
              }
            }, {
              actions: {
                items: [ { href: '/appointment-past-experiences-reasons?edit', text: 'Change' } ]
              },
              key: { text: 'Answer' },
              value: {
                html: '<pre>Reason for "Tell us how any past experiences that may affect you at the appointment"</pre>'
              }
            } ]
          }, {
            title: 'Anything else',
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Will you need anything else at the appointment?' }
            }, {
              actions: { items: [ { href: '/appointment-anything-else?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              key: { text: 'Question' },
              value: { html: 'Tell us what you will need and why you need it' }
            }, {
              actions: {
                items: [ { href: '/appointment-anything-else-reasons?edit', text: 'Change' } ]
              },
              key: { text: 'Answer' },
              value: {
                html: '<pre>Reason for "Tell us what you will need and why you need it"</pre>'
              }
            } ]
          } ]
        }, {
          title: '3. Dates to avoid',
          summaryLists: [ {
            summaryRows: [ {
              key: { text: 'Question' },
              value: { html: 'Are there any dates you cannot go to the appointment?' }
            }, {
              actions: { items: [ { href: '/appointment-dates-avoid?edit', text: 'Change' } ] },
              key: { text: 'Answer' },
              value: { html: 'Yes' }
            }, {
              actions: { items: [ { href: '/appointment-dates-avoid-enter/0?edit', text: 'Change' } ] },
              key: { text: 'Dates to avoid' },
              value: {
                html: '<b>Date</b><br><pre>08 July 2020</pre><br><b>Reason</b><br><pre>Reason 1 for "Why can you not go to the appointment on this date?"</pre>'
              }
            }, {
              actions: { items: [ { href: '/appointment-dates-avoid-enter/1?edit', text: 'Change' } ] },
              key: { text: null },
              value: {
                html: '<b>Date</b><br><pre>09 July 2020</pre><br><b>Reason</b><br><pre>Reason 2  for "Why can you not go to the appointment on this date?:</pre>'
              }
            } ]
          } ]
        }
        ]
      };

      getCheckAndSendPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', expectedArgs);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getCheckAndSendPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postCheckAndSendPage', () => {
    it('should submit CQ and redirect to confirmation page', async () => {
      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.cmaRequirements).to.eql(cmaRequirements);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.SUBMIT_CMA_REQUIREMENTS, req);
      expect(req.session.appeal.appealStatus).to.be.equal('cmaRequirementsSubmitted');
      expect(res.redirect).to.have.been.calledWith(paths.cmaRequirementsSubmitted.confirmation);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);

      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
