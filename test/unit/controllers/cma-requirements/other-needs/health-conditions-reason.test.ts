import express, { NextFunction, Request, Response } from 'express';
import {
  getHealthConditionsReason,
  postHealthConditionsReason,
  setupHealthConditionsReasonController
} from '../../../../../app/controllers/cma-requirements/other-needs/health-conditions-reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Health Conditions Reason controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

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
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHealthConditionsReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHealthConditionsReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason);
    });
  });

  describe('getHealthConditionsReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/appointment-physical-mental-health-reasons',
        pageTitle: 'Tell us how any physical or mental health conditions you have may affect you at the appointment',
        previousPage: '/appointment-physical-mental-health',
        question: {
          name: 'reason',
          title: 'Tell us how any physical or mental health conditions you have may affect you at the appointment',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getHealthConditionsReason(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.cmaRequirements.otherNeeds.healthConditionsReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/appointment-physical-mental-health-reasons',
        pageTitle: 'Tell us how any physical or mental health conditions you have may affect you at the appointment',
        previousPage: '/appointment-physical-mental-health',
        question: {
          name: 'reason',
          title: 'Tell us how any physical or mental health conditions you have may affect you at the appointment',
          value: 'previously saved answer'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getHealthConditionsReason(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHealthConditionsReason(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHealthConditionsReason', () => {
    it('should fail validation and render template with errors', async () => {
      await postHealthConditionsReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter details of how any physical or mental health conditions may affect you at the appointment'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-physical-mental-health-reasons',
        pageTitle: 'Tell us how any physical or mental health conditions you have may affect you at the appointment',
        previousPage: '/appointment-physical-mental-health',
        question: {
          name: 'reason',
          title: 'Tell us how any physical or mental health conditions you have may affect you at the appointment',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postHealthConditionsReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiences);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postHealthConditionsReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
