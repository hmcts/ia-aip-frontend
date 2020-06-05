import express, { NextFunction, Request, Response } from 'express';
import {
  getSingleSexAppointmentAllFemaleReason,
  postSingleSexAppointmentAllFemaleReason,
  setupSingleSexAppointmentAllFemaleReasonController
} from '../../../../../app/controllers/cma-requirements/other-needs/single-sex-appointment-all-female-reason';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Single sex all female Reason controller', () => {
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

  describe('setupSingleSexAppointmentAllFemaleReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupSingleSexAppointmentAllFemaleReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment);
    });
  });

  describe('getSingleSexAppointmentAllFemaleReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/appointment-single-sex-type-female',
        pageTitle: 'Tell us why you need an all-female appointment',
        previousPage: '/appointment-single-sex-type',
        question: {
          name: 'reason',
          title: 'Tell us why you need an all-female appointment',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getSingleSexAppointmentAllFemaleReason(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.cmaRequirements.otherNeeds.singleSexAppointmentReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/appointment-single-sex-type-female',
        pageTitle: 'Tell us why you need an all-female appointment',
        previousPage: '/appointment-single-sex-type',
        question: {
          name: 'reason',
          title: 'Tell us why you need an all-female appointment',
          value: 'previously saved answer'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getSingleSexAppointmentAllFemaleReason(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getSingleSexAppointmentAllFemaleReason(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postSingleSexAppointmentAllFemaleReason', () => {
    it('should fail validation and render template with errors', async () => {
      await postSingleSexAppointmentAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter the reasons you need an all-female appointment'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-single-sex-type-female',
        pageTitle: 'Tell us why you need an all-female appointment',
        previousPage: '/appointment-single-sex-type',
        question: {
          name: 'reason',
          title: 'Tell us why you need an all-female appointment',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postSingleSexAppointmentAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsPrivateAppointment);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postSingleSexAppointmentAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
