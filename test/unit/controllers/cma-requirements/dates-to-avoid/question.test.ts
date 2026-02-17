import express, { NextFunction, Request, Response } from 'express';
import {
  getDatesToAvoidQuestion,
  postDatesToAvoidQuestion,
  setupDatesToAvoidQuestionController
} from '../../../../../app/controllers/cma-requirements/dates-to-avoid/question';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.datesToAvoidQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.datesToAvoidQuestion)).to.equal(true);
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
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getDatesToAvoidQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
        error: expectedError,
        errorList: Object.values(expectedError),
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
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.cmaRequirements.datesToAvoid.isDateCannotAttend).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.datesToAvoidEnterDate)).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.cmaRequirements.datesToAvoid.isDateCannotAttend).to.equal(false);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.taskList)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
