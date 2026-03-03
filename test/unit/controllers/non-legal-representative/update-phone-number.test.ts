import { Request, Response } from 'express';
import {
  getUpdatePhoneNumber,
  getUpdatePhoneNumberConfirmation,
  postUpdatePhoneNumber, setupNlrUpdatePhoneNumberControllers,
} from '../../../../app/controllers/non-legal-representative/update-phone-number';
import { Events } from '../../../../app/data/events';
import { isJourneyAllowedMiddleware } from '../../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Update phone number controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getUpdatePhoneNumber', () => {
    it('should render update-phone-number', () => {
      getUpdatePhoneNumber(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/update-phone-number.njk', {
        previousPage: paths.common.overview
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getUpdatePhoneNumber(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postUpdatePhoneNumber', () => {
    let submitEventRefactoredStub: sinon.SinonStub;
    let renderStub: sinon.SinonStub;
    let redirectStub: sinon.SinonStub;

    beforeEach(() => {
      submitEventRefactoredStub = sandbox.stub();
      updateAppealService = {
        submitEventRefactored: submitEventRefactoredStub
      };

      redirectStub = sandbox.stub();
      renderStub = sandbox.stub();
      res = {
        render: renderStub,
        send: sandbox.stub(),
        redirect: redirectStub,
        locals: {}
      } as Partial<Response>;
    });

    it('should render update-phone-number with correct errors if phone number is empty', async () => {
      req.body = {
        'phoneNumber': ''
      };
      const expectedValidationError = {
        'phoneNumber': {
          key: 'phoneNumber',
          href: '#phoneNumber',
          text: i18n.validationErrors.phoneEmpty
        }
      };
      await postUpdatePhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/update-phone-number.njk', {
        nlrPhoneNumber: '',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.common.overview
      });
    });

    it('should render update-phone-number with correct errors if phoneNumber validation fails', async () => {
      req.body = {
        'phoneNumber': '07827297'
      };
      const expectedValidationError = {
        'phoneNumber': {
          key: 'phoneNumber',
          href: '#phoneNumber',
          text: i18n.validationErrors.phoneFormat
        }
      };
      await postUpdatePhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('non-legal-rep/update-phone-number.njk', {
        nlrPhoneNumber: '07827297',
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        previousPage: paths.common.overview
      });
    });

    it('should redirect to updatePhoneNumberConfirmation if validation and event succeeds', async () => {
      req.body = {
        'phoneNumber': '07827297000'
      };
      const nlrDetails: NlrDetails = {
        emailAddress: 'test@test.com',
        idamId: 'idamUID',
        givenNames: 'test',
        familyName: 'test2',
      };
      req.session.appeal.nlrDetails = nlrDetails;
      nlrDetails.phoneNumber = '07827297000';

      const expectedAppeal = { ...req.session.appeal, nlrDetails };
      await postUpdatePhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitEventRefactoredStub).to.be.calledOnceWith(Events.NLR_PHONE_NUMBER_SUBMITTED, expectedAppeal, 'idamUID', 'atoken');
      expect(res.redirect).to.be.calledOnceWith(paths.nonLegalRep.updatePhoneNumberConfirmation);
    });

    it('should catch a validation error and redirect with error', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postUpdatePhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });

    it('should catch event submission error and redirect with error', async () => {
      req.body = {
        'phoneNumber': '07827297000'
      };
      const error = new Error('the error');
      submitEventRefactoredStub.throws(error);
      await postUpdatePhoneNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getUpdatePhoneNumberConfirmation', () => {
    it('should render confirmation-page', () => {
      getUpdatePhoneNumberConfirmation(req as Request, res as Response, next);
      expect(res.render).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.updatePhoneNumber.confirmation.title,
        whatNextListItems: i18n.pages.updatePhoneNumber.confirmation.whatNextListItems
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getUpdatePhoneNumberConfirmation(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('setupNlrUpdatePhoneNumberControllers', () => {
    it('should return the correct routers', () => {
      const express = require('express');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [isJourneyAllowedMiddleware];

      setupNlrUpdatePhoneNumberControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updatePhoneNumber, middleware, getUpdatePhoneNumber)).to.equal(true);
      expect(routerPostStub.calledWith(paths.nonLegalRep.updatePhoneNumber, middleware, sinon.match.any)).to.equal(true);
      expect(routerGetStub.calledWith(paths.nonLegalRep.updatePhoneNumberConfirmation, middleware, getUpdatePhoneNumberConfirmation)).to.equal(true);
    });
  });
});
