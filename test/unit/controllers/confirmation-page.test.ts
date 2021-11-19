import { NextFunction, Request, Response } from 'express';
import {
  getConfirmationPage,
  setConfirmationController
} from '../../../app/controllers/appeal-application/confirmation-page';
import { paths } from '../../../app/paths';
import { addDaysToDate } from '../../../app/utils/date-utils';
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
      session: {
        appeal: {
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
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
    const middleware = [];
    setConfirmationController(middleware);
    expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.confirmation, middleware);
  });

  it('getConfirmationPage should render confirmation.njk for an on time appeal', () => {
    req.session.appeal.application.isAppealLate = false;

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      payLater: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for a late appeal', () => {
    req.session.appeal.application.isAppealLate = true;

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: true,
      payLater: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for a late appeal and pay later', () => {
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: true,
      payLater: true
    });
  });

  it('getConfirmationPage should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getConfirmationPage(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
