import express, { NextFunction, Request, Response } from 'express';
import {
  getAddAnotherDateQuestionPage, postAddAnotherDateQuestionPage,
  setupDatesToAvoidAddAnotherDateController
} from '../../../../../app/controllers/cma-requirements/dates-to-avoid/add-another-date';
import { paths } from '../../../../../app/paths';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Add Another Date Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

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
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDatesToAvoidAddAnotherDateController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupDatesToAvoidAddAnotherDateController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate);
    });
  });

  describe('getAddAnotherDateQuestionPage', () => {
    it('should render question page', () => {

      getAddAnotherDateQuestionPage(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-dates-avoid-new',
        pageTitle: 'Do you want to add another date you cannot go to the appointment?',
        previousPage: '/appointment-dates-avoid-reasons',
        question: {
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Do you want to add another date you cannot go to the appointment?'
        },
        saveAndContinueOnly: true
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAddAnotherDateQuestionPage', () => {
    it('should fail validation and render template with errors', async () => {
      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk');
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidEnterDate);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.taskList);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
