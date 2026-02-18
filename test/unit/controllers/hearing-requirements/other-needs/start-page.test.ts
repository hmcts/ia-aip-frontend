import express, { NextFunction, Request, Response } from 'express';
import {
  getHearingRequirementsStartPage,
  setupHearingRequirementsStartPageController
} from '../../../../../app/controllers/hearing-requirements/other-needs/start-page';
import { paths } from '../../../../../app/paths';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Start controller', () => {
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
        appeal: {
          hearingRequirements: {}
        } as Partial<Appeal>
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

  describe('setupHearingRequirementsStartPageController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware: Middleware[] = [];

      setupHearingRequirementsStartPageController(middleware);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.otherNeeds)).to.equal(true);
    });
  });

  describe('getHearingRequirementsStartPage', () => {
    it('should render question page', () => {

      getHearingRequirementsStartPage(req as Request, res as Response, next);

      const expectedArgs = {
        previousPage: '/hearing-needs'
      };

      expect(renderStub).to.be.calledWith('hearing-requirements/other-needs/other-needs-section.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getHearingRequirementsStartPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
