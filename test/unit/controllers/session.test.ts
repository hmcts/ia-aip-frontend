import config from 'config';
import { NextFunction, Request, Response } from 'express';
import {
  getExtendSession,
  getSessionEnded,
  setupSessionController
} from '../../../app/controllers/session';
import { paths } from '../../../app/paths';
import { expect, sinon } from '../../utils/testUtils';

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
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDateOfBirthController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      setupSessionController();
      expect(routerGetStub).to.have.been.calledWith(paths.session.extendSession);
      expect(routerGetStub).to.have.been.calledWith(paths.session.sessionExpired);
    });
  });

  describe('getExtendSession', () => {
    it('should send a new timeout', () => {
      getExtendSession(req as Request, res as Response, next);

      expect(res.send).to.have.been.calledWith({ timeout: config.get('session.cookie.maxAgeInMs') });
    });
  });

  describe('getSessionEnded', () => {
    it('should render session-ended.njk page', () => {
      getSessionEnded(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('session/session-ended.njk');
    });
  });
});
