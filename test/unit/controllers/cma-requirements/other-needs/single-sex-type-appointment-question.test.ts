import express, { NextFunction, Request, Response } from 'express';
import {
  getSingleSexTypeAppointmentQuestion,
  postSingleSexTypeAppointmentQuestion,
  setupSingleSexTypeAppointmentQuestionController
} from '../../../../../app/controllers/cma-requirements/other-needs/single-sex-type-appointment-question';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Single sex type appointment Question controller', () => {
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
        } as Partial<Appeal>
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

  describe('setupSingleSexTypeAppointmentQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupSingleSexTypeAppointmentQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment);
    });
  });

  describe('getSingleSexTypeAppointmentQuestion', () => {
    it('should render question page', () => {

      getSingleSexTypeAppointmentQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-single-sex-type',
        pageTitle: 'What type of appointment will you need?',
        previousPage: '/appointment-single-sex-type',
        question: {
          options: [ { text: 'All male', value: 'yes' }, { text: 'All female', value: 'no' } ],
          title: 'What type of appointment will you need?'
        }
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getSingleSexTypeAppointmentQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postSingleSexTypeAppointmentQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select if you need an all-female or all-male appointment'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-single-sex-type',
        pageTitle: 'What type of appointment will you need?',
        previousPage: '/appointment-single-sex-type',
        question: {
          options: [ { text: 'All male', value: 'yes' }, { text: 'All female', value: 'no' } ],
          title: 'What type of appointment will you need?'
        }
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment);
      expect(req.session.appeal.cmaRequirements.otherNeeds.singleSexTypeAppointment).to.be.eq('All male');
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment);
      expect(req.session.appeal.cmaRequirements.otherNeeds.singleSexTypeAppointment).to.be.eq('All female');
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
