import { NextFunction, Request, Response } from 'express';
import {
  getConfirmationPage,
  setConfirmationController
} from '../../../app/controllers/confirmation-page';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Confirmation Page Controller', () => {
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
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

    setConfirmationController();
    expect(routerGetStub).to.have.been.calledWith(paths.confirmation);
  });

  it('getConfirmationPage should render confirmationl.njk', () => {
    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk');
  });

  it('getConfirmationPage should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getConfirmationPage(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
