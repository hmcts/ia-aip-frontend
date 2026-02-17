import { NextFunction, Request, Response } from 'express';
import {
  getNationalityPage,
  postNationalityPage,
  setupHomeOfficeDetailsController
} from '../../../app/controllers/appeal-application/home-office-details';
import { countryList } from '../../../app/data/country-list';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { getNationalitiesOptions } from '../../../app/utils/nationalities';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('Nationality details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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

      setupHomeOfficeDetailsController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.appealStarted.nationality, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.nationality, middleware)).to.equal(true);
    });
  });

  describe('getNationalityPage', () => {
    it('should render personal-details/nationality.njk', function () {
      getNationalityPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/personal-details/nationality.njk')).to.equal(true);
    });

    it('when called with edit param  should render personal-details/nationality.njk and update session', function () {
      req.query = { 'edit': '' };
      getNationalityPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/personal-details/nationality.njk')).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
    });

    it('should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getNationalityPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          personalDetails: {
            nationality: 'AQ',
            stateless: 'hasNationality'
          }
        }
      } as Appeal);

    });

    it('should validate and redirect letter received page', async () => {
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.letterReceived)).to.equal(true);
    });

    it('when in edit mode should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);

    });

    it('should fail validation and render personal-details/nationality.njk with error when nothing selected @failing', async () => {
      req.body = {
        nationality: ''
      };
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const nationalitiesOptions = getNationalitiesOptions(countryList, '', 'Please select a nationality');
      const error = {
        href: '#nationality',
        key: 'nationality',
        text: i18n.validationErrors.nationality.selectNationality
      };

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledWith('appeal-application/personal-details/nationality.njk',
        {
          errorList: [ error ],
          errors: { nationality: error },
          nationalitiesOptions,
          previousPage: paths.appealStarted.dob
        });
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should catch an exception and call next() with error', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to letter received page when user selected No for appellantInUk', async () => {
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.appealStarted.letterReceived)).to.equal(true);
    });

    it('should redirect to letter sent page when user selected Yes for appellantInUk', async () => {
      req.session.appeal.application.appellantInUk = 'Yes';
      await postNationalityPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.appealStarted.letterSent)).to.equal(true);
    });
  });
});
