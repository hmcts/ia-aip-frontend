import { NextFunction, Request, Response } from 'express';
import { getFileNotFoundPage, setupNotFoundController } from '../../../app/controllers/file-not-found';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('File not found Controller', function() {
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
      redirect: sandbox.spy(),
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getFileNotFound', () => {
    it('getFileNotFound should render to file not found page', function() {
      getFileNotFoundPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('./errors/file-not-found.njk',{
        previousPage: {
          attributes: { onclick: 'history.go(-1); return false;' }
        }
      });
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getFileNotFoundPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('setupNotFoundController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupNotFoundController();
      expect(routerGetStub).to.have.been.calledWith(paths.common.fileNotFound);
    });
  });
});
