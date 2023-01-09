import { NextFunction, Request, Response } from 'express';
import {
  getConfirmationPage,
  setConfirmationController
} from '../../../app/controllers/appeal-application/confirmation-page';
import { States } from '../../../app/data/states';
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

  it('getConfirmationPage should render confirmation.njk for an on time, protection, paynow appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      payLater: false,
      payLaterEaEuHuAppeal: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, protection, payLater appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payLater';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      payLater: true,
      payLaterEaEuHuAppeal: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, payment-free', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'deprivation';
    appeal.paAppealTypeAipPaymentOption = 'payLater';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      payLater: false,
      payLaterEaEuHuAppeal: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, refusalOfHumanRights appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'refusalOfHumanRights';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      late: false,
      payLater: true,
      payLaterEaEuHuAppeal: true
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, refusalOfEu appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'refusalOfEu';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      late: false,
      payLater: true,
      payLaterEaEuHuAppeal: true
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, euSettlementScheme appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'euSettlementScheme';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      late: false,
      payLater: true,
      payLaterEaEuHuAppeal: true
    });
  });

  it('getConfirmationPage should render confirmation.njk for a late appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = true;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: true,
      payLater: false,
      payLaterEaEuHuAppeal: false
    });
  });

  it('getConfirmationPage should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getConfirmationPage(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
