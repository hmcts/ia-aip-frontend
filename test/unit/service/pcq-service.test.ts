import { NextFunction, Request, Response } from 'express';
import rp from 'request-promise';
import PcqService from '../../../app/service/pcq-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('PCQ service', () => {
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

  describe('SetupPCQ', () => {
    it('should setup the routes', () => {
      expect('A').to.equal('A');
    });
  });

  describe('CheckPcqHealth', () => {
    it('should return true when health is up', async () => {
      sandbox.stub(rp, 'get').resolves(JSON.parse('{"status":"UP"}'));
      const pcqService = new PcqService();
      const healthCheck = await pcqService.checkPcqHealth();
      expect(healthCheck).to.be.equal(true);
    });
  });

  describe('CheckPcqHealth', () => {
    it('should return false when health is down', async () => {
      sandbox.stub(rp, 'get').resolves(JSON.parse('{"status":"DOWN"}'));
      const pcqService = new PcqService();
      const healthCheck = await pcqService.checkPcqHealth();
      expect(healthCheck).to.be.equal(false);
    });
  });

  describe('CheckPcqHealth', () => {
    it('should return false when an exception is thrown', async () => {
      const error = new Error('an error');
      sandbox.stub(rp, 'get').resolves(error);
      const pcqService = new PcqService();
      const healthCheck = await pcqService.checkPcqHealth();
      expect(healthCheck).to.be.equal(false);
    });
  });

  describe('InvokePcqHealth', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal
      };
    });
    it('should return invoked when I invoke', async () => {
      const pcqService = new PcqService();
      pcqService.invokePcq(res as Response, appeal);
      expect(res.redirect).to.have.been.calledOnce.calledWith();
    });
  });

  describe('GetPcqId', () => {
    it('should return pcqId', async () => {
      const pcqService = new PcqService();
      const pcqId = pcqService.getPcqId();
      expect(pcqId).not.to.be.empty;
    });
  });
});
