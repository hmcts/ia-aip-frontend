const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getReasonForAppeal,
  postReasonForAppeal,
  postSupportingEvidenceSubmit,
  setupReasonsForAppealController
} from '../../../../app/controllers/reasons-for-appeal/reason-for-appeal';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

describe('Reasons for Appeal Controller', function () {
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

  describe('setupReasonsForAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupReasonsForAppealController({ updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.reasonsForAppeal.decision);
      expect(routerPOSTStub).to.have.been.calledWith(paths.reasonsForAppeal.decision);
      expect(routerGetStub).to.have.been.calledWith(paths.reasonsForAppeal.confirmation);
    });
  });

  describe('getReasonForAppeal', () => {
    it('should render reasons-for-appeal/reason-for-appeal.njk', function () {
      getReasonForAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/reason-for-appeal-page.njk', {
        previousPage: paths.overview,
        applicationReason: undefined,
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('getReasonForAppeal should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getReasonForAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

  });

  describe('postReasonForAppeal.', function () {
    it('should fail validation and render reasons-for-appeal/reason-for-appeal.njk with error', async () => {
      req.body.applicationReason = '';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
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
          askForMoreTimeFeatureEnabled: false
        }
      );
    });

    it('should pass validation and render reasons-for-appeal/reason-for-appeal.njk without error', async () => {
      req.body.applicationReason = 'Text Word';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.reasonsForAppeal.supportingEvidence);
    });

    it('when in Edit mode should pass validation and redirect to check-and-send without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.body.applicationReason = 'Text Word';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.reasonsForAppeal.checkAndSend);
    });

    it('when Save for later should pass validation and redirect to overview page without error', async () => {
      req.body.applicationReason = 'Text Word';
      req.body.saveForLater = 'saveForLater';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith('/appeal-overview?saved');
    });

    it('when in edit mode and click on Save for later should pass validation and redirect to overview page without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.body.applicationReason = 'Text Word';
      req.body.saveForLater = 'saveForLater';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith('/appeal-overview?saved');
    });
  });

  describe('postSupportingEvidenceSubmit.', function () {

    const evidenceMock = {
      someEvidenceId: {
        id: 'someEvidenceId',
        fileId: 'someUUID',
        name: 'name.png'
      }
    };
    it('should fail validation and render reasons-for-appeal/supporting-evidence-upload-page.njk with error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = undefined;
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'reasons-for-appeal/supporting-evidence-upload-page.njk',
        {
          error: [ { href: 'uploadFile', text: 'Select a file', value: '#uploadFile' } ],
          errorList: [ { 'href': 'uploadFile', 'text': 'Select a file', 'value': '#uploadFile' } ],
          askForMoreTimeFeatureEnabled: false
        }
      );
    });

    it('should pass validation and redirect to check-and-send without errors', async () => {
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.reasonsForAppeal.checkAndSend);
    });

    it('when in Edit mode should pass validation and redirect to check-and-send without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;

      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.reasonsForAppeal.checkAndSend);
    });

    it('when Save for later should pass validation and redirect to overview page without error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;
      req.body.saveForLater = 'saveForLater';
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith('/appeal-overview?saved');
    });

    it('when in edit mode and click on Save for later should pass validation and redirect to overview page without error', async () => {
      req.session.appeal.reasonsForAppeal.isEdit = true;
      req.session.appeal.reasonsForAppeal.evidences = evidenceMock;
      req.body.saveForLater = 'saveForLater';
      await postSupportingEvidenceSubmit(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith('/appeal-overview?saved');
    });
  });
});
