const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getEnterAddressForOutOfCountryAppeal, postEnterAddressForOutOfCountryAppeal, setupPersonalDetailsController } from '../../../app/controllers/appeal-application/personal-details';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Personal Details Controller - Out of Country Address Page', function () {
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
            contactDetails: null,
            personalDetails: {}
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>,
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

    res = {
      redirect: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupPersonalDetailsController(middleware, { updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.oocAddress, middleware);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.oocAddress, middleware);
    });
  });

  describe('getEnterAddressForOutOfCountryAppeal', () => {
    it('should render templates/textarea-question-page.njk', function () {
      const expectedArgs = {
        formAction: '/out-of-country-address',
        pageTitle: 'What is your address?',
        previousPage: paths.appealStarted.nationality,
        question: {
          name: 'outofcountry-address',
          title: 'What is your address?',
          description: 'Enter your address',
          value: ''
        }
      };
      getEnterAddressForOutOfCountryAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.application.appellantOutOfCountryAddress = 'out-of-country-address';
      const expectedArgs = {
        formAction: '/out-of-country-address',
        pageTitle: 'What is your address?',
        previousPage: paths.appealStarted.nationality,
        question: {
          name: 'outofcountry-address',
          title: 'What is your address?',
          description: 'Enter your address',
          value: 'out-of-country-address'
        }
      };

      getEnterAddressForOutOfCountryAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getEnterAddressForOutOfCountryAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
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
        previousPage: '/nationality',
        formAction: '/out-of-country-address',
        pageTitle: 'What is your address?',
        question: {
          name: 'outofcountry-address',
          title: 'What is your address?',
          description: 'Enter your address',
          value: ''
        }
      };
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['outofcountry-address'] = 'the answer here';
      await postEnterAddressForOutOfCountryAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postEnterAddressForOutOfCountryAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
