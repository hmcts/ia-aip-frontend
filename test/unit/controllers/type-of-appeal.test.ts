import { NextFunction, Request, Response } from 'express';
import {
  getTypeOfAppeal,
  postTypeOfAppeal,
  setupTypeOfAppealController
} from '../../../app/controllers/appeal-application/type-of-appeal';
import { appealTypes } from '../../../app/data/appeal-types';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Type of appeal Controller', () => {
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
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
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
      } as any
    } as Partial<Request>;

    updateAppealService = { submitEventRefactored: sandbox.stub() };

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

  describe('setupTypeOfAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];

      setupTypeOfAppealController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.typeOfAppeal);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.typeOfAppeal);
    });
  });

  describe('getTypeOfAppeal', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render type-of-appeal.njk with payments feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
      await getTypeOfAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes.filter(type => type.value === 'protection' || type.value === 'revocationOfProtection'),
        previousPage: paths.appealStarted.taskList
      });
    });

    it('should render type-of-appeal.njk with payments feature flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      await getTypeOfAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes,
        previousPage: paths.appealStarted.taskList
      });
    });

    it('when called with edit param should render type-of-appeal.njk and update session and payments feature flag ON', async () => {
      req.query = { 'edit': '' };
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      await getTypeOfAppeal(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes,
        previousPage: paths.appealStarted.taskList
      });
    });

    it('getTypeOfAppeal should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getTypeOfAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postTypeOfAppeal', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal,
        paAppealTypeAipPaymentOption: '',
        application: {
          ...req.session.appeal.application,
          appealType: 'human-rights'
        }
      };

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          appealType: 'human-rights'
        }
      } as Appeal);
    });

    it('should validate and redirect to the task-list page with payments flag OFF', async () => {
      req.body['appealType'] = 'human-rights';
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should validate and redirect to the task-list page with payments flag ON', async () => {
      req.body['appealType'] = 'human-rights';
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', true);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should validate and redirect to the task-list page and payments feature flag ON', async () => {
      req.body['appealType'] = 'human-rights';
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', true);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should fail validation and render type-of-appeal.njk with a validation error', async () => {
      req.body = { 'button': 'save-and-continue' };
      const expectedError: ValidationError = {
        href: '#appealType',
        key: 'appealType',
        text: 'Select an appeal type'
      };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: sinon.match.any,
        errors: { appealType: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.appealStarted.taskList
      });
    });

    it('should not validate when nothing selected and save for later clicked', async () => {
      req.body = { 'saveForLater': 'saveForLater' };
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview + '?saved');
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('when in edit mode should validate and redirect to the CYA page and reset isEdit flag', async () => {
      req.body['appealType'] = 'human-rights';
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('postTypeOfAppeal when clicked on save-and-continue with multiple selections should redirect to the next page', async () => {
      req.body = { 'button': 'save-and-continue', 'appealType': 'human-rights' };
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('postTypeOfAppeal when in edit mode when clicked on save-and-continue with multiple selections should redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = { 'button': 'save-and-continue', 'appealType': 'human-rights' };
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;

    });

    it('postTypeOfAppeal should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'button': 'save-for-later', 'appealType': 'human-rights' };
      res.redirect = sandbox.stub().throws(error);
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
