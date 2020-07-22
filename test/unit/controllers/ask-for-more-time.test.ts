const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getAskForMoreTimePage,
  getCancelAskForMoreTime,
  getCheckAndSend,
  getConfirmation,
  postAskForMoreTimePage,
  postCheckAndSend,
  setupAskForMoreTimeController
} from '../../../app/controllers/ask-for-more-time/ask-for-more-time';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { formatTextForCYA } from '../../../app/utils/utils';
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
          timeExtensions: [],
          application: {
            personalDetails: {}
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>,
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
      } as any
    } as Partial<Request>;

    res = {
      redirect: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = {
      submitEventRefactored: sandbox.stub()
    } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupAskForMoreTimeController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = sandbox.stub();
      setupAskForMoreTimeController([ middleware ], { updateAppealService });
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

  describe('getCancelAskForMoreTime', function () {
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

  describe('postAskForMoreTimePage', function () {
    let askForMoreReason = 'The reason';
    beforeEach(() => {
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        askForMoreTime: {
          reason: askForMoreReason
        }
      } as Appeal);
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should fail validation and render reasons-for-appeal/reason-for-appeal-page.njk with error', async () => {
      req.body.askForMoreTime = '';
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/ask-for-more-time.njk', {
          askForMoreTime: '',
          errorList: [ {
            'key': 'askForMoreTime',
            'text': 'Enter how much time you need and why you need it',
            'href': '#askForMoreTime'
          } ],
          errors: {
            'askForMoreTime': {
              'key': 'askForMoreTime',
              'text': 'Enter how much time you need and why you need it',
              'href': '#askForMoreTime'
            }
          },
          previousPage: paths.common.overview
        });
    });

    it('should pass validation and render reasons-for-appeal/reason-for-appeal-page.njk without error', async () => {
      req.body.askForMoreTime = askForMoreReason;
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.askForMoreTime.evidenceYesNo);
      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_TIME_EXTENSION, req.session.appeal, 'idamUID', 'atoken');

    });

    it('should setup ask for more time in session', async () => {
      req.session.appeal.appealStatus = 'current State';
      req.body.askForMoreTime = askForMoreReason;
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.askForMoreTime).to.be.eql({
        reason: askForMoreReason
      });
    });
  });

  describe('getCheckAndSend', function () {
    it('should render check and send page without evidence', () => {
      req.session.appeal.askForMoreTime.reason = 'some reasons';
      getCheckAndSend(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/check-and-send.njk', {
          previousPage: paths.common.askForMoreTime.evidenceYesNo,
          summaryRows: [ {
            key: { text: 'Question' },
            value: { html: 'How much time do you need and why do you need it?' }
          }, {
            actions: { items: [ { href: '/ask-for-more-time', text: 'Change' } ] },
            key: { text: 'Answer' },
            value: { html: formatTextForCYA(req.session.appeal.askForMoreTime.reason) }
          } ]
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
        './ask-for-more-time/check-and-send.njk', {
          previousPage: paths.common.askForMoreTime.evidenceYesNo,
          summaryRows: [ {
            key: { text: 'Question' },
            value: { html: 'How much time do you need and why do you need it?' }
          }, {
            actions: { items: [ { href: '/ask-for-more-time', text: 'Change' } ] },
            key: { text: 'Answer' },
            value: { html: formatTextForCYA(req.session.appeal.askForMoreTime.reason) }
          }, {
            actions: { items: [ { href: paths.common.askForMoreTime.supportingEvidenceUpload, text: 'Change' } ] },
            key: { text: 'Supporting evidence' },
            value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/fileId\'>name.txt</a>' }
          } ]
        });
    });
  });

  describe('postCheckAndSend', () => {
    let askForMoreReason = 'The reason';
    let appeal: Appeal;
    beforeEach(() => {
      appeal = { ...req.session.appeal };
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
        askForMoreTime: {
          reason: askForMoreReason
        }
      } as Appeal);
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('redirects user to confirmation page', async () => {
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.askForMoreTime.confirmation);
    });

    it('submits ask for more time', async () => {
      appeal.askForMoreTime.reviewTimeExtensionRequired = 'Yes';
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        askForMoreTime: {
          inFlight: true
        }
      } as Appeal);
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.SUBMIT_TIME_EXTENSION, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.askForMoreTime.inFlight).to.be.true;
    });
  });

  describe('getConfirmation', () => {
    it('renders page', () => {
      getConfirmation(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('./ask-for-more-time/confirmation.njk', {});
    });
  });
});
