import express, { NextFunction, Request, Response } from 'express';
import { getConfirmationPage, setupClarifyingQuestionsConfirmationPage } from '../../../../app/controllers/clarifying-questions/confirmation-page';
import { paths } from '../../../../app/paths';
import { expect, sinon } from '../../../utils/testUtils';

describe('ClarifyingQuestions Confirmation Controller', () => {
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
        appeal: {}
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

  describe('setupClarifyingQuestionsConfirmationPage', () => {
    it('should set the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware: Middleware[] = [];

      setupClarifyingQuestionsConfirmationPage(middleware);
      expect(routerGetStub).to.have.been.calledWith(`${paths.clarifyingQuestionsAnswersSubmitted.confirmation}`);
    });
  });

  describe('getConfirmationPage', () => {
    it('should render CYA template', () => {
      getConfirmationPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getConfirmationPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
