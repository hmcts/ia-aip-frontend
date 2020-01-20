import { NextFunction, Request, Response } from 'express';
import {
  getEligibilityServicePage,
  postEligibilityServicePage,
  setupEligibilityServicePageController
} from '../../../app/controllers/elgibility';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Appeal Eligibility Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            lateAppeal: {}
          },
          caseBuilding: {},
          hearingRequirements: {}
        } as Appeal
      } as Partial<Express.Session>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEvent: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupEligibilityServicePageController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupEligibilityServicePageController();
      expect(routerGetStub).to.have.been.calledWith(paths.eligibleService);
      expect(routerPOSTStub).to.have.been.calledWith(paths.eligibleService);
    });
  });

  describe('getEligibilityServicePage', () => {
    it('should render service-page.njk', function () {
      getEligibilityServicePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/service-page.njk');
    });
  });

  describe('postEligibilityServicePage', () => {
    it('should redirect questions.njk', function () {
      postEligibilityServicePage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith('/eligible-service');

    });
  });
});
