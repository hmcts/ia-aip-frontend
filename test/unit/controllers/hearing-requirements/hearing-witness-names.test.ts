import express, { NextFunction, Request, Response } from 'express';
import {
  getWitnessNamesPage, postWitnessNamesPage,
  setupWitnessNamesController
} from '../../../../app/controllers/hearing-requirements/hearing-witness-names';
import { paths } from '../../../../app/paths';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing Requirements - Witness Section: Witness names controller', () => {
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
          hearingRequirements: {
            witnessNames: ['My witness']
          }
        }
      }
    } as unknown as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupWitnessNamesController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupWitnessNamesController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
    });
  });

  describe('getWitnessNamesPage', () => {
    it('should render template', () => {

      const expectedArgs = {
        previousPage: '/hearing-witnesses'
      };

      getWitnessNamesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getWitnessNamesPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postWitnessNamesPage', () => {
    it('should fail validation and render template with errors', async () => {
      await postWitnessNamesPage()(req as Request, res as Response, next);

      const expectedError = {
        witnessName: {
          href: '#witnessName',
          key: 'witnessName',
          text: '"witnessName" is required'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: '/hearing-witnesses'
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/hearing-witness-names.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['witnessName'] = 'My witness name';
      await postWitnessNamesPage()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.witnessOutsideUK);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postWitnessNamesPage()(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
