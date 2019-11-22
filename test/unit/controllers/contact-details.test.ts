import { NextFunction, Request, Response } from 'express';
import {
  getContactDetails,
  postContactDetails,
  setupContactDetailsController
} from '../../../app/controllers/contact-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
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
      } as any,
      body: {}
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

  describe('setupContactDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupContactDetailsController();
      expect(routerGetStub).to.have.been.calledWith(paths.contactDetails);
      expect(routerPOSTStub).to.have.been.calledWith(paths.contactDetails);
    });
  });

  describe('getContactDetails', () => {
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
  });

  describe('postContactDetails', () => {
    it('should show validation error if no option is populated', () => {
      req.body = {
        'email-value': ''
      };
      const error: ValidationError = {
        href: '#email-value-text-message-value',
        key: 'email-value-text-message-value',
        text: i18n.validationErrors.contactDetails.selectOneOption
      };
      const expectedData = {
        email: undefined,
        phone: undefined,
        errors: { 'email-value-text-message-value': error },
        errorList: [ error ]
      };

      postContactDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
    });

    it('should validate email and redirect to task-list.njk', () => {
      const email: string = 'example@example.com';
      req.body = {
        'email-value': email
      };

      postContactDetails(req as Request, res as Response, next);
      expect(req.session.appeal.application.contactDetails.email).to.be.equal(email);
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should fail email validation and show validation error', () => {
      req.body = {
        'email-value': 'anInvalidEmail.com'
      };
      const error: ValidationError = {
        href: '#email-value',
        key: 'email-value',
        text: i18n.validationErrors.emailFormat
      };
      const expectedData = {
        email: undefined,
        phone: undefined,
        errors: { 'email-value': error },
        errorList: [ error ]
      };

      postContactDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
    });

    it('should validate phone number and redirect to task-list.njk', () => {
      req.body = {
        'text-message-value': '07123456789'
      };

      postContactDetails(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('show fail phone number validation and show validation error', () => {
      req.body = {
        'text-message-value': '1234'
      };
      const error: ValidationError = {
        href: '#text-message-value',
        key: 'text-message-value',
        text: i18n.validationErrors.phoneFormat
      };
      const expectedData = {
        email: undefined,
        phone: undefined,
        errors: { 'text-message-value': error },
        errorList: [ error ]
      };

      postContactDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
    });
  });
});
