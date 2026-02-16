import express, { NextFunction, Request, Response } from 'express';
import {
  getPrivateAppointmentReason,
  postPrivateAppointmentReason,
  setupPrivateAppointmentReasonController
} from '../../../../../app/controllers/cma-requirements/other-needs/private-appointment-reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Private Appointment Reason controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          cmaRequirements: {
            otherNeeds: {}
          }
        }
      }
    } as Partial<Request>;
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();
    submitStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();
    updateAppealService = { submitEvent: submitStub } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPrivateAppointmentReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupPrivateAppointmentReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason)).to.equal(true);
    });
  });

  describe('getPrivateAppointmentReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/appointment-private-reasons',
        pageTitle: 'Tell us why you need a private appointment',
        previousPage: '/appointment-private',
        question: {
          name: 'reason',
          title: 'Tell us why you need a private appointment',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getPrivateAppointmentReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.cmaRequirements.otherNeeds.privateAppointmentReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/appointment-private-reasons',
        pageTitle: 'Tell us why you need a private appointment',
        previousPage: '/appointment-private',
        question: {
          name: 'reason',
          title: 'Tell us why you need a private appointment',
          value: 'previously saved answer'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getPrivateAppointmentReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getPrivateAppointmentReason(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postPrivateAppointmentReason', () => {
    it('should fail validation and render template with errors', async () => {
      await postPrivateAppointmentReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter the reasons you need a private appointment'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-private-reasons',
        pageTitle: 'Tell us why you need a private appointment',
        previousPage: '/appointment-private',
        question: {
          name: 'reason',
          title: 'Tell us why you need a private appointment',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postPrivateAppointmentReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsHealthConditions)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postPrivateAppointmentReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
