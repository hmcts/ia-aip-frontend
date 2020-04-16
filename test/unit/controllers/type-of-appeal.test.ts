import { NextFunction, Request, Response } from 'express';
import {
  getTypeOfAppeal,
  postTypeOfAppeal,
  setupTypeOfAppealController
} from '../../../app/controllers/appeal-application/type-of-appeal';
import { appealTypes } from '../../../app/data/appeal-types';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
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
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
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

  describe('setupTypeOfAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupTypeOfAppealController(updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.typeOfAppeal);
      expect(routerPOSTStub).to.have.been.calledWith(paths.typeOfAppeal);
    });
  });

  describe('getTypeOfAppeal', () => {
    it('should render type-of-appeal.njk', () => {
      getTypeOfAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes,
        previousPage: paths.taskList
      });
    });

    it('when called with edit param should render type-of-appeal.njk and update session ', () => {
      req.query = { 'edit': '' };

      getTypeOfAppeal(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes,
        previousPage: paths.taskList
      });
    });

    it('getTypeOfAppeal should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getTypeOfAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postTypeOfAppeal', () => {
    it('should fail validation and render type-of-appeal.njk with a validation error', async () => {
      req.body = { 'button': 'save-and-continue' };
      const expectedError: ValidationError = {
        href: '#appealType',
        key: 'appealType',
        text: 'Select an appeal type'
      };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes,
        errors: { appealType: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.taskList
      });
    });

    it('should not validate when nothing selected and save for later clicked', async () => {
      req.body = { 'saveForLater': 'saveForLater' };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.overview + '?saved');
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
    });

    it('should validate and redirect to the task-list page', async () => {
      req.body = { 'button': 'save-and-continue', 'appealType': 'human-rights' };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.taskList);
    });

    it('when in edit mode should validate and redirect to the CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;

      req.body = { 'button': 'save-and-continue', 'appealType': 'human-rights' };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);
    });

    it('postTypeOfAppeal when clicked on save-and-continue with multiple selections should redirect to the next page', async () => {
      req.body = { 'button': 'save-and-continue', 'appealType': 'protection' };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.taskList);
    });

    it('postTypeOfAppeal when in edit mode when clicked on save-and-continue with multiple selections should redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;

      req.body = { 'button': 'save-and-continue', 'appealType': 'protection' };

      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);

    });

    it('postTypeOfAppeal should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'button': 'save-for-later', 'appealType': 'protection' };
      res.redirect = sandbox.stub().throws(error);
      await postTypeOfAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
