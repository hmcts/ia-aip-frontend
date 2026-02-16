import express, { NextFunction, Request, Response } from 'express';
import {
  getSingleSexTypeAppointmentQuestion,
  postSingleSexTypeAppointmentQuestion,
  setupSingleSexTypeAppointmentQuestionController
} from '../../../../../app/controllers/cma-requirements/other-needs/single-sex-type-appointment-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Single sex type appointment Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let submitStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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
    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub,
      send: sandbox.stub()
    } as Partial<Response>;

    updateAppealService = {
      submitEvent: submitStub
    } as Partial<UpdateAppealService>;
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment)).to.equal(true);
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
        },
        saveAndContinue: true
      };
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getSingleSexTypeAppointmentQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
        },
        saveAndContinue: true
      };
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment)).to.equal(true);
      expect(req.session.appeal.cmaRequirements.otherNeeds.singleSexTypeAppointment).to.equal('All male');
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment)).to.equal(true);
      expect(req.session.appeal.cmaRequirements.otherNeeds.singleSexTypeAppointment).to.equal('All female');
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postSingleSexTypeAppointmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
