import { NextFunction, Request, Response } from 'express';
import {
  getConfirmationPage,
  getConfirmationPaidPage,
  setConfirmationController
} from '../../../app/controllers/appeal-application/confirmation-page';
import { States } from '../../../app/data/states';
import { paths } from '../../../app/paths';
import { addDaysToDate } from '../../../app/utils/date-utils';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
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
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: false
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
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: false,
      paPayLater: true,
      paPayNow: false,
      eaHuEu: false,
      appealWithRemissionOption: false
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
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: false,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, pending payment, refusalOfHumanRights appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'refusalOfHumanRights';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: true,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, pending payment, refusalOfEu appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'refusalOfEu';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: true,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, pending payment, euSettlementScheme appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'euSettlementScheme';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: true,
      appealWithRemissionOption: false
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
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: true,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPage should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getConfirmationPage(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('getConfirmationPaidPage should render confirmation.njk for a paPayLater appeal', () => {
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payLater';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.confirmationPaid.title,
      whatNextContent: i18n.pages.confirmationPaidLater.content,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPaidPage should render confirmation.njk for a paPayNow in-time appeal paid immediately after submission', () => {
    req.session.payingImmediately = true;
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.successPage.inTime.panel,
      whatNextListItems: i18n.pages.confirmationPaid.content,
      thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPaidPage should render confirmation.njk for a paPayNow out-of-time appeal paid immeditaley after submission', () => {
    req.session.payingImmediately = true;
    const { appeal } = req.session;
    appeal.application.isAppealLate = true;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.successPage.outOfTime.panel,
      whatNextListItems: i18n.pages.confirmationPaid.contentLate,
      thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPaidPage should render confirmation.njk for a paPayNow in-time appeal paid not immediately', () => {
    req.session.payingImmediately = false;
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.confirmationPaidLater.title,
      whatNextListItems: i18n.pages.confirmationPaidLater.content,
      thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPaidPage should render confirmation.njk for a paPayNow out-of-time appeal paid not immediately', () => {
    req.session.payingImmediately = false;
    const { appeal } = req.session;
    appeal.application.isAppealLate = true;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.confirmationPaidLater.title,
      whatNextListItems: i18n.pages.confirmationPaidLater.content,
      thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPaidPage should render confirmation.njk for on time EA appeal', () => {
    req.session.payingImmediately = false;
    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'refusalOfEu';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.successPage.inTime.panel,
      whatNextListItems: i18n.pages.confirmationPaid.content,
      thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPaidPage should render confirmation.njk for a late EA appeal', () => {
    req.session.payingImmediately = false;
    const { appeal } = req.session;
    appeal.application.isAppealLate = true;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'refusalOfEu';

    getConfirmationPaidPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      date: addDaysToDate(5),
      title: i18n.pages.successPage.outOfTime.panel,
      whatNextListItems: i18n.pages.confirmationPaid.contentLate,
      thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
      appealWithRemissionOption: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an appeal with the remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.remissionOption = 'asylumSupportFromHo';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: undefined,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: true
    });
  });

  it('getConfirmationPage should render confirmation.njk for an appeal with the remission option and late appeal', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.remissionOption = 'asylumSupportFromHo';
    appeal.application.isAppealLate = true;

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: true,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: true
    });
  });

  it('getConfirmationPage should render confirmation.njk for an appeal with the remission option and late appeal Out' +
    ' of the country', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.remissionOption = 'asylumSupportFromHo';
    appeal.application.isAppealLate = true;
    appeal.appealOutOfCountry = 'Yes';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      dateOutOfCountryAppeal: addDaysToDate(28),
      late: true,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: true
    });
  });

  it('getConfirmationPage should render confirmation.njk for an appeal without the remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.remissionOption = 'noneOfTheseStatements';
    appeal.application.helpWithFeesOption = 'willPayForAppeal';

    getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      dateOutOfCountryAppeal: addDaysToDate(14),
      late: undefined,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: false
    });
  });

});
