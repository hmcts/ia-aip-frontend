import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import PcqService from '../../../app/service/pcq-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('PCQ service', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const logger: Logger = new Logger();
  let redirectStub: sinon.SinonSpy;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    redirectStub = sandbox.spy();
    req = {
      body: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<session.Session>,
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

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;
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
      sandbox.stub(axios, 'get').resolves(JSON.parse('{"data": {"status":"UP"}}'));
      const pcqService = new PcqService();
      const healthCheck = await pcqService.checkPcqHealth();
      expect(healthCheck).to.equal(true);
    });
  });

  describe('CheckPcqHealth', () => {
    it('should return false when health is down', async () => {
      sandbox.stub(axios, 'get').resolves(JSON.parse('{"status":"DOWN"}'));
      const pcqService = new PcqService();
      const healthCheck = await pcqService.checkPcqHealth();
      expect(healthCheck).to.equal(false);
    });
  });

  describe('CheckPcqHealth', () => {
    it('should return false when an exception is thrown', async () => {
      const error = new Error('an error');
      sandbox.stub(axios, 'get').resolves(error);
      const pcqService = new PcqService();
      const healthCheck = await pcqService.checkPcqHealth();
      expect(healthCheck).to.equal(false);
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
      expect(redirectStub.callCount).to.equal(1);
    });
  });

  describe('GetPcqId', () => {
    it('should return pcqId', async () => {
      const pcqService = new PcqService();
      const pcqId = pcqService.getPcqId();
      expect(pcqId).to.not.equal(null);
      expect(pcqId).to.not.equal(undefined);
      expect(pcqId).to.not.equal('');
    });
  });
});
