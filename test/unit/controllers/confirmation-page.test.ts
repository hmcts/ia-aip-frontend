import { NextFunction, Request, Response } from 'express';
import {
  getConfirmationPage,
  getConfirmationPaidPage,
  setConfirmationController
} from '../../../app/controllers/appeal-application/confirmation-page';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { States } from '../../../app/data/states';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
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

  it('getConfirmationPage should render confirmation.njk for an on time, protection, paynow appeal', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, protection, payLater appeal', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payLater';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      paPayLater: true,
      paPayNow: false,
      eaHuEu: false,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, payment-free', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'deprivation';
    appeal.paAppealTypeAipPaymentOption = 'payLater';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: false,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, pending payment, refusalOfHumanRights appeal', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'refusalOfHumanRights';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: true,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, pending payment, refusalOfEu appeal', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'refusalOfEu';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: true,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for an on time, pending payment, euSettlementScheme appeal', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = false;
    appeal.appealStatus = States.PENDING_PAYMENT.id;
    appeal.application.appealType = 'euSettlementScheme';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(14),
      late: false,
      paPayLater: false,
      paPayNow: false,
      eaHuEu: true,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for a late appeal', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const { appeal } = req.session;
    appeal.application.isAppealLate = true;
    appeal.appealStatus = States.APPEAL_SUBMITTED.id;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: true,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: false,
      noRemissionOption: false,
      askHomeOffice: 'A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Tribunal Caseworker will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should catch an exception and call next()', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);

    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    await getConfirmationPage(req as Request, res as Response, next);
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
      appealWithRemissionOption: false,
      noRemissionOption: false
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
      appealWithRemissionOption: false,
      noRemissionOption: false
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
      appealWithRemissionOption: false,
      noRemissionOption: false
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
      appealWithRemissionOption: false,
      noRemissionOption: false
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
      appealWithRemissionOption: false,
      noRemissionOption: false
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
      appealWithRemissionOption: false,
      noRemissionOption: false
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
      appealWithRemissionOption: false,
      noRemissionOption: false
    });
  });

  it('getConfirmationPage should render confirmation.njk for an appeal with the remission option', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.remissionOption = 'asylumSupportFromHo';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: undefined,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: true,
      noRemissionOption: false,
      askHomeOffice: 'A Legal Officer will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Legal Officer will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Legal Officer will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

  it('getConfirmationPage should render confirmation.njk for an appeal without the remission option', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.remissionOption = 'noneOfTheseStatements';
    appeal.application.helpWithFeesOption = 'willPayForAppeal';

    await getConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('confirmation-page.njk', {
      date: addDaysToDate(5),
      late: undefined,
      paPayLater: false,
      paPayNow: true,
      eaHuEu: false,
      appealWithRemissionOption: false,
      noRemissionOption: true,
      askHomeOffice: 'A Legal Officer will ask the Home Office to send any documents it has about your case to the Tribunal',
      whatToDoNext: 'A Legal Officer will check the Home Office documents and then contact you to tell you what to do next',
      askHomeOfficeOutOfTime: 'A Legal Officer will look at the reasons your appeal was late and decide if your appeal can continue'
    });
  });

});
