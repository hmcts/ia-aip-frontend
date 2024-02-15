import { NextFunction, Request, Response } from 'express';
import {
  getFeeSupport,
  postFeeSupport,
  setupFeeSupportController
} from '../../../app/controllers/appeal-application/fee-support';
import { paths } from '../../../app/paths';
import PcqService from '../../../app/service/pcq-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('fee support Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let pcqService: Partial<PcqService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    updateAppealService = { submitEventRefactored: sandbox.stub() };
    pcqService = { checkPcqHealth: sandbox.stub(), getPcqId: sandbox.stub() };

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

  describe('setupFeeSupportController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupFeeSupportController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.feeSupport);
      expect(routerPostStub).to.have.been.calledWith(paths.appealStarted.feeSupport);
    });
  });

  describe('getFeeSupport', () => {
    it('should render fee-support.njk template', async () => {
      await getFeeSupport(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/fee-support.njk', {
        previousPage: paths.appealStarted.taskList,
        pageTitle: '',
        formAction: paths.appealStarted.feeSupport,
        saveAndContinue: true
      });
    });

  });

  describe('postDecisionType', () => {

    it('should validate and redirect to the task-list page ', async () => {
      await postFeeSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });
  });
});
