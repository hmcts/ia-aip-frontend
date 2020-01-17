import express, { NextFunction, Request, Response } from 'express';
import { getIneligible, setupEligibilityQuestionsController } from '../../../../app/controllers/eligibility-questions/eligibility';
import { paths } from '../../../../app/paths';
import { expect, sinon } from '../../../utils/testUtils';

describe('Eligibility Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any,
      cookies: {},
      idam: {}
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupEligibilityQuestionsController', () => {
    it('should set up routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');

      setupEligibilityQuestionsController();
      expect(routerGetStub).to.have.been.calledWith(paths.eligibility.ineligible);
    });
  });

  describe('getIneligible', () => {
    it('should render the view', () => {
      getIneligible(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('eligibility/ineligible-page.njk',
        {
          previousPage: paths.eligibility.start
        }
      );
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getIneligible(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
