const express = require('express');
import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import {
  getNationalityPage,
  postNationalityPage,
  setupPersonalDetailsController
} from '../../../app/controllers/appeal-application/personal-details';
import { countryList } from '../../../app/data/country-list';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { getNationalitiesOptions } from '../../../app/utils/nationalities';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Nationality details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any,
      session: {
        appeal: {
          application: {
            personalDetails: {}
          }
        }
      }
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEventRefactored: sandbox.stub() };
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
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.nationality, middleware);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.nationality, middleware);
    });
  });

  describe('getNationalityPage', () => {
    it('should render personal-details/nationality.njk', function () {
      getNationalityPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/nationality.njk');
    });

    it('when called with edit param  should render personal-details/nationality.njk and update session', function () {
      req.query = { 'edit': '' };
      getNationalityPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/nationality.njk');
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
    });

    it('should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNationalityPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postNationality', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.nationality = 'AQ';
      req.body.stateless = 'hasNationality';
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            nationality: 'AQ',
            stateless: 'hasNationality'
          }
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          personalDetails: {
            nationality: 'AQ',
            stateless: 'hasNationality'
          }
        }
      } as Appeal);

    });

    it('should redirect to out of country address page when ooc feature is enabled', async () => {
      // ooc feature flag is enabled
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(true);

      // appeal is out of country
      req.session.appeal.appealOutOfCountry = 'Yes';
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.oocAddress);
    });

    it('should validate and redirect personal-details/nationality.njk', async () => {
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.enterPostcode);
    });

    it('when in edit mode should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;

    });

    it('should fail validation and render personal-details/nationality.njk with error when nothing selected @failing', async () => {
      req.body = {
        nationality: ''
      };
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const nationalitiesOptions = getNationalitiesOptions(countryList, '', 'Please select a nationality');
      const error = {
        href: '#undefined',
        key: undefined,
        text: i18n.validationErrors.nationality.selectNationality
      };

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/nationality.njk',
        {
          errorList: [ error ],
          errors: { undefined: error },
          nationalitiesOptions,
          previousPage: paths.appealStarted.dob
        });
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch an exception and call next() with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
    it('redirects to enter postcode page if no address has been set', async () => {
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.enterPostcode);
    });

    it('redirects to enter address page if address has been set', async () => {
      _.set(req.session.appeal.application, 'personalDetails.address.line1', 'addressLine1');
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.enterAddress);
    });
  });
});
