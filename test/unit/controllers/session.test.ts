import { NextFunction, Request, Response } from 'express';

import { jest } from '@jest/globals';
import { expect, sinon } from '../../utils/testUtils';

import config from 'config';
import {
  getExtendSession,
  getSessionEnded,
  setupSessionController
} from '../../../app/controllers/session';
import { paths } from '../../../app/paths';

const express = require('express');

describe('session controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
      idam: {
        userDetails: {}
      },
      app: {
        locals: {}
      } as any
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy(),
      locals: {}
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupSessionController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      setupSessionController();
      expect(routerGetStub).to.have.been.calledWith(paths.common.extendSession);
      expect(routerGetStub).to.have.been.calledWith(paths.common.sessionExpired);
    });
  });

  describe('getExtendSession', () => {
    it('should send a new timeout', () => {
      getExtendSession(req as Request, res as Response, next);

      expect(res.send).to.have.been.calledWith({
        timeout: sinon.match.typeOf('object')
      });
      expect(next).to.have.not.been.called;
    });
    it('should call next with error if an exception is thrown', () => {
      const errorStub = sinon.stub(config, 'get').throws(new Error('Config error'));
      getExtendSession(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error).and(sinon.match.has('message', 'Config error')));
      errorStub.restore();
    });
  });

  describe('getSessionEnded', () => {
    it('should render session-ended.njk page', () => {
      getSessionEnded(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('session/session-ended.njk');
    });
  });
});
