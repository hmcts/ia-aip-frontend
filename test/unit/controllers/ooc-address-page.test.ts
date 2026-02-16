import { Request, Response } from 'express';
import session from 'express-session';
import { OSPlacesClient } from '../../../app/clients/OSPlacesClient';
import { getEnterAddressForOutOfCountryAppeal, postEnterAddressForOutOfCountryAppeal, setupContactDetailsController } from '../../../app/controllers/appeal-application/contact-details';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('Personal Details Controller - Out of Country Address Page', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  const osPlacesClient = new OSPlacesClient('someToken');
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: null,
            personalDetails: {}
          }
        } as Partial<Appeal>
      } as Partial<session.Session>,
      body: {},
      idam: {
        userDetails: {
          uid: 'someid'
        }
      },
      cookies: {
        '__auth-token': 'atoken'
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupContactDetailsController(middleware, { updateAppealService, osPlacesClient } as any);
      expect(routerGetStub.calledWith(paths.appealStarted.oocAddress, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.oocAddress, middleware)).to.equal(true);
    });
  });

  describe('getEnterAddressForOutOfCountryAppeal', () => {
    it('should render templates/textarea-question-page.njk', function () {
      const expectedArgs = {
        formAction: '/out-of-country-address',
        pageTitle: 'What is your address?',
        previousPage: paths.appealStarted.contactDetails,
        question: {
          name: 'outofcountry-address',
          title: 'What is your address?',
          description: 'Enter your address',
          value: ''
        }
      };
      getEnterAddressForOutOfCountryAppeal(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.application.appellantOutOfCountryAddress = 'out-of-country-address';
      const expectedArgs = {
        formAction: '/out-of-country-address',
        pageTitle: 'What is your address?',
        previousPage: paths.appealStarted.contactDetails,
        question: {
          name: 'outofcountry-address',
          title: 'What is your address?',
          description: 'Enter your address',
          value: 'out-of-country-address'
        }
      };

      getEnterAddressForOutOfCountryAppeal(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getEnterAddressForOutOfCountryAppeal(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

  });

  describe('postEnterAddressForOutOfCountryAppeal', () => {
    it('should fail validation and render template with errors', async () => {
      await postEnterAddressForOutOfCountryAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        'outofcountry-address': {
          key: 'outofcountry-address',
          text: 'Enter your address',
          href: '#outofcountry-address'
        }
      };

      const expectedArgs = {
        errorList: Object.values(expectedError),
        error: expectedError,
        previousPage: '/contact-preferences',
        formAction: '/out-of-country-address',
        pageTitle: 'What is your address?',
        question: {
          name: 'outofcountry-address',
          title: 'What is your address?',
          description: 'Enter your address',
          value: ''
        }
      };
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);

    });

    it('should validate and redirect to next page', async () => {
      req.body['outofcountry-address'] = 'the answer here';
      await postEnterAddressForOutOfCountryAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.hasSponsor)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postEnterAddressForOutOfCountryAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
