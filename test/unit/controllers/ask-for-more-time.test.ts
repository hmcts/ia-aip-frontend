const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getAskForMoreTimePage,
  getCancelAskForMoreTime,
  getCheckAndSend,
  postAskForMoreTimePage,
  postCheckAndSend,
  setupAskForMoreTimeController
} from '../../../app/controllers/ask-for-more-time/ask-for-more-time';
import { Events } from '../../../app/data/events';
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
          reasonsForAppeal: {},
          askForMoreTime: {},
          previousAskForMoreTime: []
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

    updateAppealService = {
      submitEvent: sandbox.stub()
    } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupAskForMoreTimeController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupAskForMoreTimeController({ updateAppealService });
      expect(routerPOSTStub).to.have.been.calledWith(paths.common.askForMoreTime.reason);
      expect(routerGetStub).to.have.been.calledWith(paths.common.askForMoreTime.reason);
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
        previousPage: paths.common.overview,
        askForMoreTime: undefined
      });
    });

  });

  describe('getCancelAskForMoreTime', function() {
    it('getAskForMoreTimePage redirects to overview and clear ask for more time iun session', () => {
      req.session.appeal.askForMoreTime = {
        reason: 'some reason'
      };
      getCancelAskForMoreTime(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        paths.common.overview
      );

      expect(req.session.appeal.askForMoreTime).to.be.eql({});
    });
  });

  describe('postAskForMoreTimePage.', function () {
    it('should fail validation and render reasons-for-appeal/reason-for-appeal-page.njk with error', async () => {
      req.body.askForMoreTime = '';
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/ask-for-more-time.njk',{
          askForMoreTime: '',
          errorList: [{ 'key': 'askForMoreTime','text': 'Enter how much time you need and why you need it','href': '#askForMoreTime' }],
          errors: { 'askForMoreTime': { 'key': 'askForMoreTime','text': 'Enter how much time you need and why you need it','href': '#askForMoreTime' } },
          previousPage: paths.common.overview
        });
    });

    it('should pass validation and render reasons-for-appeal/reason-for-appeal-page.njk without error', async () => {
      req.body.askForMoreTime = 'Text Word';
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.askForMoreTime.evidenceYesNo);
    });

    it('should setup ask for more time in session', async () => {
      req.session.appeal.appealStatus = 'current State';
      req.body.askForMoreTime = 'Text Word';
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.askForMoreTime).to.be.eql({
        reason: 'Text Word',
        evidence: undefined,
        status: 'inProgress',
        state: 'current State'
      });
    });
  });

  describe('getCheckAndSend', function() {
    it('should render check and send page without evidence', () => {
      req.session.appeal.askForMoreTime.reason = 'some reasons';
      getCheckAndSend(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/check-and-send.njk',{
          previousPage: paths.common.askForMoreTime.evidenceYesNo,
          summaryRows: [{
            key: { text: 'Question' },
            value: { html: 'How much time do you need and why do you need it?' }
          }, {
            actions: { items: [{ href: '/ask-for-more-time', text: 'Change' }] },
            key: { text: 'Answer' },
            value: { html: `<span class='answer'>${req.session.appeal.askForMoreTime.reason}</span>` }
          }]
        });
    });

    it('should render check and send page with evidence', () => {
      req.session.appeal.askForMoreTime.reason = 'some reasons';
      req.session.appeal.askForMoreTime.evidence = [
        {
          fileId: 'fileId',
          name: 'name.txt'
        }
      ];
      getCheckAndSend(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/check-and-send.njk',{
          previousPage: paths.common.askForMoreTime.evidenceYesNo,
          summaryRows: [{
            key: { text: 'Question' },
            value: { html: 'How much time do you need and why do you need it?' }
          }, {
            actions: { items: [{ href: '/ask-for-more-time', text: 'Change' }] },
            key: { text: 'Answer' },
            value: { html: `<span class='answer'>${req.session.appeal.askForMoreTime.reason}</span>` }
          }, {
            actions: { items: [{ href: paths.common.askForMoreTime.supportingEvidenceUpload, text: 'Change' }] },
            key: { text: 'Supporting evidence' },
            value: { html: 'name.txt' }
          }]
        });
    });
  });

  describe('postCheckAndSend', () => {
    it('redirects user to overview page', async () => {
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('submits ask for more time', async () => {
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.SUBMIT_TIME_EXTENSION, req);
    });
  });
});
