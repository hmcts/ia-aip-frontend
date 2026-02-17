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
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;

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
    renderStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getWhatToExpectPage', () => {
    it('getCmaGuidancePage should render to guidance  page', function() {
      getCmaGuidancePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('case-management-appointment/what-to-expect.njk',{
        previousPage : { attributes: { onclick: 'history.go(-1); return false;' } }
      });
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getCmaGuidancePage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('setupWhatToExpectController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const middleware = [];
      setupcmaGuidancePageController(middleware);
      expect(routerGetStub.calledWith(paths.common.whatToExpectAtCMA)).to.equal(true);
    });
  });
});
