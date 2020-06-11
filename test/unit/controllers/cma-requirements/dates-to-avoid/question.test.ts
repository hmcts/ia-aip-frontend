import express, { NextFunction, Request, Response } from 'express';
import {
  getAddAnotherDateQuestionPage,
  postAddAnotherDateQuestionPage
} from '../../../../../app/controllers/cma-requirements/dates-to-avoid/add-another-date';
import {
  getDatesToAvoidQuestion, postDatesToAvoidQuestion,
  setupDatesToAvoidQuestionController
} from '../../../../../app/controllers/cma-requirements/dates-to-avoid/question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Question controller', () => {
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
          cmaRequirements: {}
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

  describe('setupDatesToAvoidQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupDatesToAvoidQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidQuestion);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidQuestion);
    });
  });

  describe('getDatesToAvoidQuestion', () => {
    it('should render question page', () => {

      getDatesToAvoidQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-dates-avoid',
        pageTitle: 'Are there any dates you cannot go to the appointment?',
        previousPage: '/appointment-needs',
        question: {
          description: 'You will need to tell us why you cannot go to the appointment on the dates you include.',
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Are there any dates you cannot go to the appointment?'
        },
        saveAndContinue: true
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getDatesToAvoidQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDatesToAvoidQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if there are any dates you cannot go to the appointment'
        }
      };

      const expectedArgs = {
        error: expectedError ,
        errorList: Object.values(expectedError),
        formAction: '/appointment-dates-avoid',
        pageTitle: 'Are there any dates you cannot go to the appointment?',
        previousPage: '/appointment-needs',
        question: {
          description: 'You will need to tell us why you cannot go to the appointment on the dates you include.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Are there any dates you cannot go to the appointment?'
        },
        saveAndContinue: true
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.cmaRequirements.datesToAvoid.isDateCannotAttend).to.be.true;
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidEnterDate);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.cmaRequirements.datesToAvoid.isDateCannotAttend).to.be.false;
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.taskList);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
