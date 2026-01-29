import { NextFunction, Response } from 'express';
import type { Request } from 'express-serve-static-core';
import { getIndex, setupIndexController } from '../../../app/controllers';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('Index Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any,
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
      redirect: sandbox.spy(),
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getIndex', () => {
    it('get Index should redirect to start page', function() {
      getIndex(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.start);
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      getIndex(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('setupIndexController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupIndexController();
      expect(routerGetStub).to.have.been.calledWith(paths.common.index);
    });
  });
});
