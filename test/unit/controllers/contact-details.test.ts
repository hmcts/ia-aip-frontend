import { NextFunction, Request, Response } from 'express';
import {
  getContactDetails,
  postContactDetails,
  setupContactDetailsController
} from '../../../app/controllers/appeal-application/contact-details';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Contact details Controller', () => {
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

    updateAppealService = { submitEvent: sandbox.stub() };

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

      setupContactDetailsController(updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.contactDetails);
      expect(routerPOSTStub).to.have.been.calledWith(paths.contactDetails);
    });
  });

  describe('getContactDetails', () => {
    it('getContactDetails should render type-of-appeal.njk', () => {
      getContactDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/contact-details.njk');
    });

    it('when called with edit param getContactDetail should render type-of-appeal.njk and update session', () => {
      req.query = { 'edit': '' };
      getContactDetails(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
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

    describe('validates selections', () => {
      it('should show validation error if no option is selected', async () => {
        req.body = {};

        const contactDetailsExpectation = {
          email: null,
          phone: null,
          wantsEmail: false,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#selections',
          key: 'selections',
          text: i18n.validationErrors.contactDetails.selectOneOption
        };
        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'selections': error },
          errorList: [ error ],
          previousPage: paths.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
      });

      it('should show 2 validation error both options are selected but left blank', async () => {
        req.body = {
          selections: [ 'email', 'text-message' ],
          'email-value': '',
          'text-message-value': ''
        };

        const contactDetailsExpectation = {
          email: '',
          phone: '',
          wantsEmail: false,
          wantsSms: false
        };

        const emailError: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailEmpty
        };
        const textMessageError: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneEmpty
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'email-value': emailError, 'text-message-value': textMessageError },
          errorList: [ emailError, textMessageError ],
          previousPage: paths.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
      });

      it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
        req.body = {
          'email-value': '',
          'text-message-value': '',
          'saveForLater': 'saveForLater'
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.redirect).to.have.been.calledWith(paths.taskList);
      });

    });

    describe('email cases', () => {
      it('should show email empty validation error if email is selected but left blank', async () => {
        req.body = {
          selections: [ 'email' ],
          'email-value': ''
        };

        const contactDetailsExpectation = {
          email: '',
          phone: null,
          wantsEmail: false, // wantsEmail expectation is false because flag doesn't update if email value isn't accepted
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailEmpty
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'email-value': error },
          errorList: [ error ],
          previousPage: paths.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
      });

      it('should show email format validation error if email is selected but not a valid email', async () => {
        req.body = {
          selections: [ 'email' ],
          'email-value': 'notanemail@example'
        };

        const contactDetailsExpectation = {
          email: 'notanemail@example',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        const error: ValidationError = {
          href: '#email-value',
          key: 'email-value',
          text: i18n.validationErrors.emailFormat
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'email-value': error },
          errorList: [ error ],
          previousPage: paths.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
      });

      it('should validate email and redirect to task-list.njk', async () => {
        req.body = {
          selections: [ 'email' ],
          'email-value': 'valid@example.net'
        };

        const contactDetailsExpectation = {
          email: 'valid@example.net',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetailsExpectation);
        expect(res.redirect).to.have.been.calledWith(paths.taskList);
      });
      it('when in edit mode should validate email and redirect to check-and-send.njk and reset isEdit flag', async () => {
        req.session.appeal.application.isEdit = true;

        req.body = {
          selections: [ 'email' ],
          'email-value': 'valid@example.net'
        };

        const contactDetailsExpectation = {
          email: 'valid@example.net',
          phone: null,
          wantsEmail: true,
          wantsSms: false
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetailsExpectation);
        expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
        expect(req.session.appeal.application.isEdit).to.have.eq(false);
      });
    });

    describe('text message cases', () => {
      it('should show phone empty validation error if phone number is selected but left blank', async () => {
        req.body = {
          selections: [ 'text-message' ],
          'text-message-value': ''
        };

        const contactDetailsExpectation = {
          email: null,
          phone: '',
          wantsEmail: false,
          wantsSms: false // wantsSms expectation is false because flag doesn't update if phone value isn't accepted
        };

        const error: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneEmpty
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'text-message-value': error },
          errorList: [ error ],
          previousPage: paths.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
      });

      it('should show phone format validation error if text-message is selected but not a valid phone number', async () => {
        req.body = {
          selections: [ 'text-message' ],
          'text-message-value': '00'
        };

        const contactDetailsExpectation = {
          email: null,
          phone: '00',
          wantsEmail: false,
          wantsSms: true
        };

        const error: ValidationError = {
          href: '#text-message-value',
          key: 'text-message-value',
          text: i18n.validationErrors.phoneFormat
        };

        const expectedData = {
          contactDetails: contactDetailsExpectation,
          errors: { 'text-message-value': error },
          errorList: [ error ],
          previousPage: paths.taskList
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(res.render).to.have.been.calledWith('appeal-application/contact-details.njk', expectedData);
      });

      it('should validate phone number and redirect to task-list.njk', async () => {
        req.body = {
          selections: [ 'text-message' ],
          'text-message-value': '07123456789'
        };

        const contactDetailsExpectation = {
          email: null,
          phone: '07123456789',
          wantsEmail: false,
          wantsSms: true
        };

        await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
        expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetailsExpectation);
        expect(res.redirect).to.have.been.calledWith(paths.taskList);
      });
    });

    it('when in edit mode should validate phone number and redirect to check-and-send.njk and reset isEdit', async () => {
      req.session.appeal.application.isEdit = true;

      req.body = {
        selections: [ 'text-message' ],
        'text-message-value': '07123456789'
      };

      const contactDetailsExpectation = {
        email: null,
        phone: '07123456789',
        wantsEmail: false,
        wantsSms: true
      };

      await postContactDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.application.contactDetails).to.deep.equal(contactDetailsExpectation);
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);
    });
  });
});
