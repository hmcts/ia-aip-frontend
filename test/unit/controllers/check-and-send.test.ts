import { NextFunction, Request, Response } from 'express';
import {
  getCheckAndSend,
  postCheckAndSend,
  setupCheckAndSendController
} from '../../../app/controllers/check-and-send';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

function getMockedSummaryRows() {
  return [ {
    actions: { items: [ { href: '/href', text: 'Change' } ] },
    key: { text: 'Home Office reference number' },
    value: { html: 'A1234567' }
  }, {
    actions: { items: [ { href: '/home-office/letter-sent', text: 'Change' } ] },
    key: { text: 'Date Letter Sent' },
    value: { html: '1 July 2019' }
  }, {
    actions: { items: [ { href: '/personal-details/name', text: 'Change' } ] },
    key: { text: 'Name' },
    value: { html: 'Pedro Jimenez' }
  }, {
    actions: { items: [ { href: '/personal-details/date-of-birth', text: 'Change' } ] },
    key: { text: 'Date of birth' },
    value: { html: '10 October 1980' }
  }, {
    actions: { items: [ { href: '/personal-details/nationality', text: 'Change' } ] },
    key: { text: 'Nationality' },
    value: { html: 'Panamanian' }
  }, {
    actions: { items: [ { href: '/contact-details', text: 'Change' } ] },
    key: { text: 'Contact Details' },
    value: {
      html: 'pedro.jimenez@example.net<br>07123456789<br>60 Beautiful Street<br>Flat 2<br>London<br>W1W 7RT<br>United Kingdom'
    }
  }, {
    actions: { items: [ { href: '/type-of-appeal', text: 'Change' } ] },
    key: { text: 'Appeal type' },
    value: { html: 'Protection' }
  } ];
}

describe('Check and Send Controller', () => {
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

    setupCheckAndSendController();
    expect(routerGetStub).to.have.been.calledWith(paths.checkAndSend);
    expect(routerPOSTStub).to.have.been.calledWith(paths.checkAndSend);
  });

  it('getCheckAndSend should render check-and-send.njk', () => {
    getCheckAndSend(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/check-and-send.njk');
  });

  it('postCheckAndSend should fail validation when statement of truth not checked', () => {
    req.body = { 'button': 'save-and-continue', 'data': [] };

    postCheckAndSend(req as Request, res as Response, next);

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
      summaryRows: summaryRows
    });
  });

  it('postCheckAndSend when accepted statement and clicked send should redirect to the next page', () => {
    req.body = { statement: 'acceptance' };

    postCheckAndSend(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledOnce.calledWith(paths.confirmation);
  });

  it('getCheckAndSend should catch exception and call next with the error', () => {
    const error = new Error('an error');
    res.render = sandbox.stub().throws(error);
    getCheckAndSend(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('postCheckAndSend should catch exception and call next with the error', () => {
    const error = new Error('an error');
    req.body = { statement: 'acceptance' };
    res.redirect = sandbox.stub().throws(error);
    postCheckAndSend(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
