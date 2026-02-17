import express, { NextFunction, Request, Response } from 'express';
import { getConfirmationPage, setupClarifyingQuestionsConfirmationPage } from '../../../../app/controllers/clarifying-questions/confirmation-page';
import { paths } from '../../../../app/paths';
import { expect, sinon } from '../../../utils/testUtils';

describe('ClarifyingQuestions Confirmation Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {}
      }
    } as Partial<Request>;
    renderStub = sandbox.stub();
    res = {
      render: renderStub,
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupClarifyingQuestionsConfirmationPage', () => {
    it('should set the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware: Middleware[] = [];

      setupClarifyingQuestionsConfirmationPage(middleware);
      expect(routerGetStub.calledWith(`${paths.common.clarifyingQuestionsAnswersSentConfirmation}`)).to.equal(true);
    });
  });

  describe('getConfirmationPage', () => {
    it('should render CYA template', () => {
      getConfirmationPage(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/confirmation-page.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getConfirmationPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
