import express, { NextFunction, Request, Response } from 'express';
import { SinonStub } from 'sinon';
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
  let next: SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonSpy;

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
    redirectStub = sandbox.spy();
    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate)).to.equal(true);
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
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postAddAnotherDateQuestionPage', () => {
    it('should fail validation and render template with errors', async () => {
      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(renderStub.calledWith('templates/radio-question-page.njk')).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.datesToAvoidEnterDate)).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.taskList)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
