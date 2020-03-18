const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
getAskForMoreTimePage, postAskForMoreTimePage, setupAskForMoreTimeController
} from '../../../app/controllers/ask-for-more-time/ask-for-more-time';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Ask for more time Controller', function () {
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
          reasonsForAppeal: {}
        } as Partial<Appeal>
      } as Partial<Express.Session>,
      body: {},
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
      redirect: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupAskForMoreTimeController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupAskForMoreTimeController();
      expect(routerPOSTStub).to.have.been.calledWith(paths.askForMoreTime);
      expect(routerGetStub).to.have.been.calledWith(paths.askForMoreTime);
    });
  });

  describe('getAskForMoreTimePage', () => {
    it('getAskForMoreTimePage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAskForMoreTimePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('getAskForMoreTimePage should be called with render', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getAskForMoreTimePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('./ask-for-more-time/ask-for-more-time.njk', {
        previousPage: paths.overview
      });
    });

  });

  describe('postAskForMoreTimePage.', function () {
    it('should fail validation and render reasons-for-appeal/reason-for-appeal-page.njk with error', async () => {
      req.body.askForMoreTime = '';
      postAskForMoreTimePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/ask-for-more-time.njk',{
          askForMoreTime: '',
          errorList: [{ 'key': 'askForMoreTime','text': 'Enter how much time you need and why you need it','href': '#askForMoreTime' }],
          errors: { 'askForMoreTime': { 'key': 'askForMoreTime','text': 'Enter how much time you need and why you need it','href': '#askForMoreTime' } },
          previousPage: paths.overview
        });
    });

    it('should pass validation and render reasons-for-appeal/reason-for-appeal-page.njk without error', async () => {
      req.body.askForMoreTime = 'Text Word';
      postAskForMoreTimePage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.overview);
    });
  });
});
