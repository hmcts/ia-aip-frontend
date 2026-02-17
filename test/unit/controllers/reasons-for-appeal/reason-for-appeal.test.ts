import config from 'config';
import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  getReasonForAppeal,
  postReasonForAppeal,
  postSupportingEvidenceSubmit,
  setupReasonsForAppealController
} from '../../../../app/controllers/reasons-for-appeal/reason-for-appeal';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { asBooleanValue } from '../../../../app/utils/utils';
import { expect, sinon } from '../../../utils/testUtils';
const express = require('express');

describe('Reasons for Appeal Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          reasonsForAppeal: {}
        } as Partial<Appeal>
      } as Partial<session.Session>,
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
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();

    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupReasonsForAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupReasonsForAppealController(middleware, { updateAppealService });
      expect(routerGetStub.calledWith(paths.awaitingReasonsForAppeal.decision, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.awaitingReasonsForAppeal.decision, middleware)).to.equal(true);
      expect(routerGetStub.calledWith(paths.reasonsForAppealSubmitted.confirmation, middleware)).to.equal(true);
    });
  });

  describe('getReasonForAppeal', () => {
    it('should render reasons-for-appeal/reason-for-appeal.njk', function () {
      getReasonForAppeal(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('reasons-for-appeal/reason-for-appeal-page.njk', {
        previousPage: paths.common.overview,
        applicationReason: undefined,
        askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime')),
        askForMoreTimeInFlight: false
      });
    });

    it('getReasonForAppeal should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getReasonForAppeal(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

  });

  describe('postReasonForAppeal.', function () {
    it('should fail validation and render reasons-for-appeal/reason-for-appeal.njk with error', async () => {
      req.body.applicationReason = '';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith(
        'reasons-for-appeal/reason-for-appeal-page.njk',
        {
          error: {
            applicationReason: {
              href: '#applicationReason',
              key: 'applicationReason',
              text: 'Enter the reasons you think the Home Office decision is wrong'
            }
          },
          errorList: [ {
            href: '#applicationReason',
            key: 'applicationReason',
            text: 'Enter the reasons you think the Home Office decision is wrong'
          } ],
          askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
        }
      );
    });

    it('should pass validation and render reasons-for-appeal/reason-for-appeal.njk without error', async () => {
      req.body.applicationReason = 'Text Word';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.awaitingReasonsForAppeal.supportingEvidence)).to.equal(true);
    });

    it('when in Edit mode should pass validation and redirect to check-and-send without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.body.applicationReason = 'Text Word';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.awaitingReasonsForAppeal.checkAndSend)).to.equal(true);
    });

    it('when Save for later should pass validation and redirect to overview page without error', async () => {
      req.body.applicationReason = 'Text Word';
      req.body.saveForLater = 'saveForLater';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith('/appeal-overview?saved')).to.equal(true);
    });

    it('when in edit mode and click on Save for later should pass validation and redirect to overview page without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.body.applicationReason = 'Text Word';
      req.body.saveForLater = 'saveForLater';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith('/appeal-overview?saved')).to.equal(true);
    });

    it('when Save and ask for more time should pass validation and redirect to more time page without error', async () => {
      req.body.applicationReason = 'Text Word';
      req.body.saveAndAskForMoreTime = 'saveAndAskForMoreTime';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.common.askForMoreTimeReason)).to.equal(true);
    });
  });

  describe('postSupportingEvidenceSubmit.', function () {

    const evidenceMock = [
      {
        fileId: 'someUUID',
        name: 'name.png'
      }
    ];
    it('should fail validation and render reasons-for-appeal/supporting-evidence-upload-page.njk with error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = undefined;
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith(
        'reasons-for-appeal/supporting-evidence-upload-page.njk',
        {
          error: [ { href: '#file-upload', text: 'Select a file', value: '#file-upload' } ],
          errorList: [ { 'href': '#file-upload', 'text': 'Select a file', 'value': '#file-upload' } ],
          askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
        }
      );
    });

    it('should pass validation and redirect to check-and-send without errors', async () => {
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.awaitingReasonsForAppeal.checkAndSend)).to.equal(true);
    });

    it('when in Edit mode should pass validation and redirect to check-and-send without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;

      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.awaitingReasonsForAppeal.checkAndSend)).to.equal(true);
    });

    it('when Save for later should pass validation and redirect to overview page without error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;
      req.body.saveForLater = 'saveForLater';
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith('/appeal-overview?saved')).to.equal(true);
    });

    it('when in edit mode and click on Save for later should pass validation and redirect to overview page without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;
      req.body.saveForLater = 'saveForLater';
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith('/appeal-overview?saved')).to.equal(true);
    });
  });
});
