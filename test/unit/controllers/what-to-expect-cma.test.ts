import { NextFunction, Request, Response } from 'express';
import { getCmaGuidancePage, setupcmaGuidancePageController } from '../../../app/controllers/cma-requirements/what-to-expect';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('CMA Guidance Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any,
      body: {}
    } as Partial<Request>;

    updateAppealService = { submitEvent: sandbox.stub() };

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

  describe('getWhatToExpectPage', () => {
    it('getCmaGuidancePage should render to guidance  page', function() {
      getCmaGuidancePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('case-management-appointment/what-to-expect.njk',{
        previousPage: paths.awaitingCmaRequirements.taskList
      });
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getCmaGuidancePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('setupWhatToExpectController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const middleware = [];
      setupcmaGuidancePageController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.common.whatToExpect);
    });
  });
});
