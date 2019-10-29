import { NextFunction, Request, Response } from 'express';
import {
  getContactDetails,
  postContactDetails,
  setupContactDetailsController
} from '../../../app/controllers/contact-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Contact details Controller', () => {
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

    setupContactDetailsController();
    expect(routerGetStub).to.have.been.calledWith(paths.contactDetails);
    expect(routerPOSTStub).to.have.been.calledWith(paths.contactDetails);
  });

  it('getContactDetails should render type-of-appeal.njk', () => {
    getContactDetails(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/contact-details.njk');
  });

  it('getContactDetails should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getContactDetails(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('postContactDetails when click on save-and-continue with no options should show validation error', () => {
    req.body = {
      button: 'save-and-continue'
    };
    postContactDetails(req as Request, res as Response, next);

    const expectedData = {
      data: { email: { value: undefined }, textMessage: { value: undefined } },
      errors: { selections: 0 }
    };
    expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
  });

  it('email on success when click on save-and-continue should validate and redirect to task-list.njk', () => {
    req.body = {
      selections: [ 'email' ],
      'email-value': 'alejandro@example.net',
      button: 'save-and-continue'
    };

    postContactDetails(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledWith(paths.taskList);
  });

  it('postContactDetails when click on save-and-continue with email selected and empty value should show validation error', () => {
    req.body = {
      selections: [ 'email' ],
      'email-value': '',
      button: 'save-and-continue'
    };
    postContactDetails(req as Request, res as Response, next);

    const expectedData = {
      'data': { 'email': { 'value': '' }, 'textMessage': { 'value': undefined } },
      'errors': { 'email-value': { 'key': 'email-value', 'text': 'Enter an email address', 'href': '#email-value' } },
      'errorList': [ { 'key': 'email-value', 'text': 'Enter an email address', 'href': '#email-value' } ]
    };
    expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
  });

  it('postContactDetails when click on save-and-continue with email selected and invalid format value should show validation error', () => {
    req.body = {
      selections: [ 'email' ],
      'email-value': 'anInvalidEmail.com',
      button: 'save-and-continue'
    };
    postContactDetails(req as Request, res as Response, next);

    const expectedData = {
      'data': { 'email': { 'value': 'anInvalidEmail.com' }, 'textMessage': { 'value': undefined } },
      'errors': {
        'email-value': {
          'key': 'email-value',
          'text': 'Enter an email address in the correct format, like name@example.com',
          'href': '#email-value'
        }
      },
      'errorList': [ {
        'key': 'email-value',
        'text': 'Enter an email address in the correct format, like name@example.com',
        'href': '#email-value'
      } ]
    };

    expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
  });

  it('phone on success when click on save-and-continue should validate and redirect to task-list.njk', () => {
    req.body = {
      selections: [ 'text-message' ],
      'text-message-value': '07123456789',
      button: 'save-and-continue'
    };

    postContactDetails(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledWith(paths.taskList);
  });

  it('postContactDetails when click on save-and-continue with text message selected and empty value should show validation error', () => {
    req.body = {
      selections: [ 'text-message' ],
      'text-message-value': '',
      button: 'save-and-continue'
    };
    postContactDetails(req as Request, res as Response, next);

    const expectedData = {
      'data': { 'email': { 'value': undefined }, 'textMessage': { 'value': '' } },
      'errors': {
        'text-message-value': {
          'key': 'text-message-value',
          'text': 'Enter a phone number',
          'href': '#text-message-value'
        }
      },
      'errorList': [ { 'key': 'text-message-value', 'text': 'Enter a phone number', 'href': '#text-message-value' } ]
    };
    expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
  });

  it('postContactDetails when click on save-and-continue with text message selected and invalid format value should show validation error', () => {
    req.body = {
      selections: [ 'text-message' ],
      'text-message-value': '1234',
      button: 'save-and-continue'
    };
    postContactDetails(req as Request, res as Response, next);

    const expectedData = {
      'data': { 'email': { 'value': undefined }, 'textMessage': { 'value': '1234' } },
      'errors': {
        'text-message-value': {
          'key': 'text-message-value',
          'text': 'Enter a telephone number, like 01632 960 002, 07700 900 982 or +44 808 157 0192',
          'href': '#text-message-value'
        }
      },
      'errorList': [ {
        'key': 'text-message-value',
        'text': 'Enter a telephone number, like 01632 960 002, 07700 900 982 or +44 808 157 0192',
        'href': '#text-message-value'
      } ]
    };

    expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
  });

});
