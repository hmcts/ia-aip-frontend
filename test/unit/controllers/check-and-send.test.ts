import { NextFunction, Request, Response } from 'express';
import {
  createSummaryRowsFrom,
  getCheckAndSend,
  postCheckAndSend,
  setupCheckAndSendController
} from '../../../app/controllers/appeal-application/check-and-send';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { addSummaryRow } from '../../../app/utils/summary-list';
import { formatTextForCYA } from '../../../app/utils/utils';
import { expect, sinon } from '../../utils/testUtils';
import { createDummyAppealApplication } from '../mockData/mock-appeal';

const express = require('express');

function getMockedSummaryRows(): SummaryRow[] {
  return [ {
    actions: { items: [ { href: '/home-office-reference-number?edit', text: 'Change' } ] },
    key: { text: 'Home Office reference number' },
    value: { html: 'A1234567' }
  }, {
    actions: { items: [ { href: paths.appealStarted.letterSent + '?edit', text: 'Change' } ] },
    key: { text: 'Date letter sent' },
    value: { html: '1 July 2019' }
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
    value: { html: 'Protection' }
  } ];
}

describe('createSummaryRowsFrom', () => {

  it('should create rows', () => {
    const appeal: Appeal = createDummyAppealApplication();
    const rows: any[] = createSummaryRowsFrom(appeal.application);
    expect(rows).to.be.deep.equal(getMockedSummaryRows());
  });

  it('should create rows when appeal is late', () => {
    const appeal: Appeal = createDummyAppealApplication();
    appeal.application.isAppealLate = true;
    appeal.application.lateAppeal = {
      reason: 'The reason why I am late'
    };

    const rows: any[] = createSummaryRowsFrom(appeal.application);
    const appealLateRow = addSummaryRow('Reason for late appeal', [ formatTextForCYA(appeal.application.lateAppeal.reason) ], paths.appealStarted.appealLate);
    const mockedRows: SummaryRow[] = getMockedSummaryRows();
    mockedRows.push(appealLateRow);
    expect(rows).to.be.deep.equal(mockedRows);
  });
});

describe('Check and Send Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          status: 'appealStarted'
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

    setupCheckAndSendController(middleware, updateAppealService as UpdateAppealService);
    expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.checkAndSend, middleware);
    expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.checkAndSend, middleware);
  });

  it('getCheckAndSend should render check-and-send-page.njk', () => {
    req.session.appeal = createDummyAppealApplication();
    getCheckAndSend(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/check-and-send.njk');
  });

  it('postCheckAndSend should fail validation when statement of truth not checked', async () => {
    req.session.appeal = createDummyAppealApplication();
    req.body = { 'button': 'save-and-continue', 'data': [] };

    await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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

  it('postCheckAndSend when accepted statement and clicked send should redirect to the next page', async () => {
    req.session.appeal = createDummyAppealApplication();
    req.body = { statement: 'acceptance' };
    updateAppealService.submitEventRefactored = sandbox.stub().returns({
      appealStatus: 'appealSubmitted',
      appealReferenceNumber: 'PA/1234567'
    } as Appeal);
    await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    expect(req.session.appeal.appealStatus).to.be.equal('appealSubmitted');
    expect(req.session.appeal.appealReferenceNumber).to.be.equal('PA/1234567');
    expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealSubmitted.confirmation);
  });

  it('getCheckAndSend should catch exception and call next with the error', () => {
    req.session.appeal = createDummyAppealApplication();
    const error = new Error('an error');
    res.render = sandbox.stub().throws(error);
    getCheckAndSend(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('postCheckAndSend should catch exception and call next with the error', async () => {
    req.session.appeal = createDummyAppealApplication();
    const error = new Error('an error');
    req.body = { statement: 'acceptance' };
    res.redirect = sandbox.stub().throws(error);
    updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
      appealStatus: 'appealSubmitted',
      appealReferenceNumber: 'PA/1234567'
    } as Appeal);
    await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
