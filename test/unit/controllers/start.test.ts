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
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;

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
    renderStub = sinon.stub();
    res = {
      render: renderStub,
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getStart', () => {
    it('get Index should render index.njk', function() {
      getStart(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('start.njk')).to.equal(true);
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getStart(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('setupIndexController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupStartController();
      expect(routerGetStub.calledWith(paths.common.start)).to.equal(true);
    });
  });
});
