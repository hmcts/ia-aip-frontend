import { NextFunction, Request, Response } from 'express';
import {
  createSummaryRowsFrom,
  getCheckAndSend,
  getFinishPayment,
  getPayLater,
  postCheckAndSend,
  setupCheckAndSendController
} from '../../../app/controllers/appeal-application/check-and-send';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import PaymentService from '../../../app/service/payments-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { addSummaryRow } from '../../../app/utils/summary-list';
import { formatTextForCYA } from '../../../app/utils/utils';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';
import { createDummyAppealApplication } from '../mockData/mock-appeal';

const express = require('express');

function getMockedSummaryRows(appealType = 'protection'): SummaryRow[] {
  return [ {
    actions: { items: [ { href: '/home-office-reference-number?edit', text: 'Change' } ] },
    key: { text: 'Home Office reference number' },
    value: { html: 'A1234567' }
  }, {
    actions: { items: [ { href: paths.appealStarted.letterSent + '?edit', text: 'Change' } ] },
    key: { text: 'Date letter sent' },
    value: { html: '1 July 2019' }
  }, {
    actions: { items: [ { href: paths.appealStarted.homeOfficeDecisionLetter + '?edit', text: 'Change' } ] },
    key: { text: 'Home Office decision letter' },
    value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/anId\'>name</a>' }
  }, {
    actions: { items: [ { href: paths.appealStarted.name + '?edit', text: 'Change' } ] },
    key: { text: 'Name' },
    value: { html: 'Pedro Jimenez' }
  }, {
    actions: { items: [ { href: paths.appealStarted.dob + '?edit', text: 'Change' } ] },
    key: { text: 'Date of birth' },
    value: { html: '10 October 1980' }
  }, {
    actions: { items: [ { href: paths.appealStarted.nationality + '?edit', text: 'Change' } ] },
    key: { text: 'Nationality' },
    value: { html: 'Austria' }
  }, {
    actions: { items: [ { href: paths.appealStarted.enterAddress + '?edit', text: 'Change' } ] },
    key: { text: 'Address' },
    value: {
      html: '60 Beautiful Street<br>Flat 2<br>London<br>W1W 7RT<br>London'
    }
  }, {
    actions: { items: [ { href: paths.appealStarted.contactDetails + '?edit', text: 'Change' } ] },
    key: { text: 'Contact details' },
    value: {
      html: 'pedro.jimenez@example.net<br>07123456789'
    }
  }, {
    actions: { items: [ { href: paths.appealStarted.typeOfAppeal + '?edit', text: 'Change' } ] },
    key: { text: 'Appeal type' },
    value: { html: i18n.appealTypes[appealType].name }
  } ];
}

describe('createSummaryRowsFrom', () => {
  let req: Partial<Request>;
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      query: {},
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      session: {
        appeal: createDummyAppealApplication()
      } as Partial<Express.Session>
    } as Partial<Request>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create rows', async () => {
    const rows: any[] = await createSummaryRowsFrom(req as Request);

    expect(rows).to.be.deep.equal(getMockedSummaryRows());
  });

  it('should create rows when appeal is late', async () => {
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.application.lateAppeal = {
      reason: 'The reason why I am late'
    };

    const rows: any[] = await createSummaryRowsFrom(req as Request);
    const appealLateRow = addSummaryRow('Reason for late appeal', [ formatTextForCYA(req.session.appeal.application.lateAppeal.reason) ], paths.appealStarted.appealLate);
    const mockedRows: SummaryRow[] = getMockedSummaryRows();
    mockedRows.push(appealLateRow);
    expect(rows).to.be.deep.equal(mockedRows);
  });

  it('should create rows when appeal is late with evidence', async () => {
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.application.lateAppeal = {
      reason: 'The reason why I am late',
      evidence: {
        fileId: 'fileId',
        name: 'filename'
      }
    };

    const rows: any[] = await createSummaryRowsFrom(req as Request);
    const appealLateRow = addSummaryRow('Reason for late appeal', [ formatTextForCYA(req.session.appeal.application.lateAppeal.reason), `<p class=\"govuk-!-font-weight-bold\">Supporting evidence</p><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/fileId'>filename</a>` ], paths.appealStarted.appealLate);
    const mockedRows: SummaryRow[] = getMockedSummaryRows();
    mockedRows.push(appealLateRow);
    expect(rows).to.be.deep.equal(mockedRows);
  });

  it('should create rows when appeal type is deprivation payments flag is ON', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
    req.session.appeal.application.appealType = 'deprivation';

    const rows: any[] = await createSummaryRowsFrom(req as Request);
    const decisionType = addSummaryRow(i18n.pages.checkYourAnswers.decisionType, [ i18n.pages.checkYourAnswers['decisionWithHearing'] ], paths.appealStarted.decisionType);
    const mockedRows: SummaryRow[] = getMockedSummaryRows('deprivation');
    mockedRows.push(decisionType);
    expect(rows).to.be.deep.equal(mockedRows);
  });

  it('should create rows when payments flag is ON', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';

    const rows: any[] = await createSummaryRowsFrom(req as Request);
    const decisionType = addSummaryRow(i18n.pages.checkYourAnswers.decisionType, [ i18n.pages.checkYourAnswers['decisionWithHearing'] ], paths.appealStarted.decisionType);
    const mockedRows: SummaryRow[] = getMockedSummaryRows();
    mockedRows.push(decisionType);
    expect(rows).to.be.deep.equal(mockedRows);
  });

  it('should create rows when paynow and payments flag is ON', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
    req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';

    const rows: any[] = await createSummaryRowsFrom(req as Request);
    const decisionType = addSummaryRow(i18n.pages.checkYourAnswers.decisionType, [ i18n.pages.checkYourAnswers['decisionWithHearing'] ], paths.appealStarted.decisionType);
    const paymentType = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.paymentType, [ i18n.pages.checkYourAnswers['payNow'] ], `${paths.appealStarted.payNow}?edit`);
    const mockedRows: SummaryRow[] = getMockedSummaryRows();
    mockedRows.push(decisionType);
    mockedRows.push(paymentType);
    expect(rows).to.be.deep.equal(mockedRows);
  });
});

describe('Check and Send Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let paymentService: Partial<PaymentService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          status: 'appealStarted',
          application: {}
        }
      } as any,
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

    updateAppealService = {
      submitEventRefactored: sandbox.stub().returns({
        state: 'appealSubmitted',
        case_data: { appealReferenceNumber: 'PA/1234567' }
      })
    };
    const statusHistories = [{
      status: 'Success',
      date_created: 'aDate'
    }];
    paymentService = {
      createPayment: sandbox.stub(),
      initiatePayment: sandbox.stub().resolves(),
      getPaymentDetails: sandbox.stub().resolves(JSON.stringify({ status: 'Success', status_histories: statusHistories }))
    } as Partial<PaymentService>;

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
    const middleware = [];

    setupCheckAndSendController(middleware, updateAppealService as UpdateAppealService, paymentService as PaymentService);
    expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.checkAndSend, middleware);
    expect(routerGetStub).to.have.been.calledWith(paths.common.finishPayment, middleware);
    expect(routerGetStub).to.have.been.calledWith(paths.common.payLater, middleware);
    expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.checkAndSend, middleware);
  });

  describe('getCheckAndSend', () => {

    it('should render check-and-send-page.njk and Payments flag is OFF', async () => {
      req.session.appeal = createDummyAppealApplication();
      req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      req.session.appeal.feeWithHearing = '80';
      req.session.appeal.feeWithoutHearing = '140';
      await getCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/check-and-send.njk', {
        summaryRows: sinon.match.any,
        previousPage: paths.appealStarted.taskList
      });
    });

    it('getCheckAndSend should render check-and-send-page.njk, pay now and decision with hearing applicationCheckAndSend with Payments flag is ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      req.session.appeal = createDummyAppealApplication();
      req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      req.session.appeal.feeWithHearing = '80';
      req.session.appeal.feeWithoutHearing = '140';
      await getCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/check-and-send.njk', {
        summaryRows: sinon.match.any,
        previousPage: paths.appealStarted.taskList,
        fee: '80',
        payNow: true
      });
    });

    it('getCheckAndSend should render check-and-send-page.njk, pay now and decision without hearing applicationCheckAndSend with Payments flag is ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      req.session.appeal = createDummyAppealApplication();
      req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithoutHearing';
      req.session.appeal.feeWithHearing = '80';
      req.session.appeal.feeWithoutHearing = '140';
      await getCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/check-and-send.njk', {
        summaryRows: sinon.match.any,
        previousPage: paths.appealStarted.taskList,
        fee: '140',
        payNow: true
      });
    });

    it('getCheckAndSend should catch exception and call next with the error', async () => {
      req.session.appeal = createDummyAppealApplication();
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getCheckAndSend(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postCheckAndSend', () => {
    it('should fail validation when statement of truth not checked', async () => {
      req.session.appeal = createDummyAppealApplication();
      req.body = { 'button': 'save-and-continue', 'data': [] };

      await postCheckAndSend(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      const expectedError = {
        statement: {
          href: '#statement',
          key: 'statement',
          text: 'Select if you believe the information you have given is true.'
        }
      };

      const summaryRows = getMockedSummaryRows();
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/check-and-send.njk', {
        error: expectedError,
        errorList: Object.values(expectedError),
        summaryRows: summaryRows,
        previousPage: paths.appealStarted.taskList
      });
    });

    it('should submit application and redirect when accepted statement and clicked send', async () => {
      req.session.appeal = createDummyAppealApplication();
      req.body = { statement: 'acceptance' };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        appealStatus: 'appealSubmitted',
        appealReferenceNumber: 'PA/1234567'
      } as Appeal);
      await postCheckAndSend(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      expect(req.session.appeal.appealStatus).to.be.equal('appealSubmitted');
      expect(req.session.appeal.appealReferenceNumber).to.be.equal('PA/1234567');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealSubmitted.confirmation);
    });

    it('should submit application and redirect if no payment needed', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      req.session.appeal = createDummyAppealApplication();
      req.session.appeal.application.appealType = 'deprivation';
      req.body = { statement: 'acceptance' };
      await postCheckAndSend(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.called;
      expect(res.redirect).to.have.been.called;
    });

    it('should initiate payment for "protection" appeal type and payNow', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      req.session.appeal = createDummyAppealApplication();
      req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';
      req.body = { statement: 'acceptance' };
      await postCheckAndSend(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      expect(paymentService.initiatePayment).to.have.been.called;
    });

    it('should submit appeal for "protection" appeal type and payLater', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      req.session.appeal = createDummyAppealApplication();
      req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
      req.body = { statement: 'acceptance' };
      await postCheckAndSend(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.called;
      expect(res.redirect).to.have.been.called;
    });

    it('should catch exception and call next with the error', async () => {
      req.session.appeal = createDummyAppealApplication();
      const error = new Error('an error');
      req.body = { statement: 'acceptance' };
      res.redirect = sandbox.stub().throws(error);
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
        appealStatus: 'appealSubmitted',
        appealReferenceNumber: 'PA/1234567'
      } as Appeal);
      await postCheckAndSend(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getFinishPayment', () => {
    it('should finish a payment', async () => {
      req.session.appeal.paymentReference = 'aReference';
      updateAppealService.submitEventRefactored = sandbox.stub().resolves({
        paymentStatus: 'Paid',
        paymentDate: 'aDate',
        isFeePaymentEnabled: 'Yes'
      } as Partial<Appeal>);

      await getFinishPayment(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      expect(req.session.appeal.paymentStatus).to.be.eql('Paid');
      expect(req.session.appeal.paymentDate).to.be.eql('aDate');
      expect(req.session.appeal.isFeePaymentEnabled).to.be.eql('Yes');
      expect(res.redirect).to.have.been.calledWith(paths.common.confirmationPayLater);
    });

    it('should atch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.session.appeal.paymentReference = 'aReference';
      updateAppealService.submitEventRefactored = sandbox.stub().throws(error);

      await getFinishPayment(updateAppealService as UpdateAppealService, paymentService as PaymentService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getPayLater', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    });

    it('should init a later payment @paylater', async () => {
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.feeCode = 'aCode';
      await getPayLater(paymentService as PaymentService)(req as Request, res as Response, next);

      expect(paymentService.initiatePayment).to.have.been.called;
    });

    it('should atch exception and call next with the error', async () => {
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      req.session.appeal.feeWithHearing = '140';
      const error = new Error('an error');
      paymentService.initiatePayment = sandbox.stub().throws(error);
      updateAppealService.submitEventRefactored = sandbox.stub().throws(error);

      await getPayLater(paymentService as PaymentService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
