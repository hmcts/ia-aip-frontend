import { NextFunction, Request, Response } from 'express';
import { getStart, setupStartController } from '../../../app/controllers/startController';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('Index Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
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
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getStart', () => {
    it('get Index should render index.njk', function() {
      getStart(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('start.njk');
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getStart(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('setupIndexController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupStartController();
      expect(routerGetStub).to.have.been.calledWith(paths.common.start);
    });
  });
});
