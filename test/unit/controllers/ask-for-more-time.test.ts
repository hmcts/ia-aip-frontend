const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getAskForMoreTimeEvidence,
  getAskForMoreTimePage,
  getCancelAskForMoreTime,
  getCheckAndSend,
  getConfirmation,
  getUploadEvidence,
  postAdditionalSupportingEvidenceQuestionPage,
  postAskForMoreTimePage,
  postCheckAndSend,
  setupAskForMoreTimeController
} from '../../../app/controllers/ask-for-more-time/ask-for-more-time';
import * as uploadEvidenceController from '../../../app/controllers/upload-evidence/upload-evidence-controller';
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
      expect(routerPOSTStub).to.have.been.calledWith(paths.common.askForMoreTimeReason);
      expect(routerGetStub).to.have.been.calledWith(paths.common.askForMoreTimeReason);
    });
  });

  describe('getAskForMoreTimeEvidence', () => {
    it('should call getEvidenceYesNo', () => {
      const getEvidenceYesNoStub = sandbox.stub(uploadEvidenceController, 'getEvidenceYesNo');
      getAskForMoreTimeEvidence(req as Request, res as Response, next);

      expect(getEvidenceYesNoStub).to.have.been.called;
    });
  });

  describe('postAdditionalSupportingEvidenceQuestionPage', () => {
    it('should call postEvidenceYesNo', () => {
      const postEvidenceYesNoStub = sandbox.stub(uploadEvidenceController, 'postEvidenceYesNo');
      postAdditionalSupportingEvidenceQuestionPage(req as Request, res as Response, next);

      expect(postEvidenceYesNoStub).to.have.been.called;
    });
  });

  describe('getUploadEvidence', () => {
    it('should call getUploadPage', () => {
      const getUploadPageStub = sandbox.stub(uploadEvidenceController, 'getUploadPage');
      getUploadEvidence(req as Request, res as Response, next);

      expect(getUploadPageStub).to.have.been.called;
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
      expect(res.redirect).to.have.been.calledWith(paths.common.askForMoreTimeSupportingEvidence);
    });

    it('should pass validation and render reasons-for-appeal/reason-for-appeal-page.njk without error', async () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      req.body.askForMoreTime = askForMoreReason;
      await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });

    // TODO: remove ask for more time if not needed
    // it('should setup ask for more time in session', async () => {
    //   req.session.appeal.appealStatus = 'current State';
    //   req.body.askForMoreTime = askForMoreReason;
    //   await postAskForMoreTimePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    //   expect(req.session.appeal.askForMoreTime).to.be.eql({
    //     reason: askForMoreReason
    //   });
    // });
  });

  describe('getCheckAndSend', function () {
    it('should render check and send page without evidence', () => {
      req.session.appeal.makeAnApplicationDetails = 'some reasons';
      getCheckAndSend(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/check-and-send.njk', {
          previousPage: paths.common.askForMoreTimeSupportingEvidence,
          summaryRows: [ {
            key: { text: 'Question' },
            value: { html: 'How much time do you need and why do you need it?' }
          }, {
            actions: { items: [ { href: '/ask-for-more-time', text: 'Change' } ] },
            key: { text: 'Answer' },
            value: { html: formatTextForCYA(req.session.appeal.makeAnApplicationDetails) }
          } ]
        });
    });

    it('should render check and send page with evidence', () => {
      req.session.appeal.makeAnApplicationDetails = 'some reasons';
      req.session.appeal.askForMoreTime.evidence = [
        {
          fileId: 'fileId',
          name: 'name.txt'
        }
      ];
      getCheckAndSend(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        './ask-for-more-time/check-and-send.njk', {
          previousPage: paths.common.askForMoreTimeSupportingEvidence,
          summaryRows: [ {
            key: { text: 'Question' },
            value: { html: 'How much time do you need and why do you need it?' }
          }, {
            actions: { items: [ { href: '/ask-for-more-time', text: 'Change' } ] },
            key: { text: 'Answer' },
            value: { html: formatTextForCYA(req.session.appeal.makeAnApplicationDetails) }
          }, {
            actions: { items: [ { href: paths.common.askForMoreTimeSupportingEvidenceUpload, text: 'Change' } ] },
            key: { text: 'Supporting evidence' },
            value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/fileId\'>name.txt</a>' }
          } ]
        });
    });

    it('should call next with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      req.session.appeal.makeAnApplicationDetails = 'some reasons';

      getCheckAndSend(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
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
      expect(res.redirect).to.have.been.calledWith(paths.common.askForMoreTimeConfirmation);
    });

    it('submits ask for more time', async () => {
      appeal.askForMoreTime.reviewTimeExtensionRequired = 'Yes';
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        askForMoreTime: {
          inFlight: true
        }
      } as Appeal);
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.MAKE_AN_APPLICATION.TIME_EXTENSION, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.askForMoreTime.inFlight).to.be.true;
    });

    it('should call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      await postCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getConfirmation', () => {
    it('renders page', () => {
      getConfirmation(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('./ask-for-more-time/confirmation.njk', {});
    });

    it('should call next with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getConfirmation(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
