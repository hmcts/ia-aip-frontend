import { NextFunction, Request, Response } from 'express';
import {
  getSupportingEvidencePage,
  postSupportingEvidencePage,
  setupReasonsForAppealController
} from '../../../../app/controllers/reasons-for-appeal/reason-for-appeal';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Supporting Evidence Upload Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
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
    documentManagementService = { uploadFile: sandbox.stub(), deleteFile: sandbox.stub() };

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

  describe('setupReasonsForAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      const deps = {
        updateAppealService: updateAppealService as UpdateAppealService,
        documentManagementService: documentManagementService as DocumentManagementService
      };
      setupReasonsForAppealController(deps);
      expect(routerGetStub).to.have.been.calledWith(paths.reasonsForAppeal.supportingEvidence);
      expect(routerPOSTStub).to.have.been.calledWith(paths.reasonsForAppeal.supportingEvidence);
    });
  });

  describe('getSupportingEvidencePage', () => {
    it('should render reasons-for-appeal/supporting-evidence-page.njk', () => {
      getSupportingEvidencePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-page.njk', {
        previousPage: paths.reasonsForAppeal.reason
      });
    });

    it('getTypeOfAppeal should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getSupportingEvidencePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postSupportingEvidencePage', () => {
    it('should fail validation and render reasons-for-appeal/supporting-evidence-page.njk with a validation error', async () => {
      req.body = {};
      const expectedError: ValidationError = {
        href: '#answer',
        key: 'answer',
        text: 'Select Yes if you want to provide supporting evidence'
      };

      postSupportingEvidencePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-page.njk', {
        error: { answer: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.reasonsForAppeal.reason
      });
    });

    it('when no is selected should validate and redirect to the check-and-send page', async () => {
      req.body = { 'answer': 'no' };

      postSupportingEvidencePage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.reasonsForAppeal.checkAndSend);
    });

    it('when yes is selected should validate and redirect to the supporting-evidence-upload page', async () => {
      req.body = { 'answer': 'yes' };

      postSupportingEvidencePage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.reasonsForAppeal.supportingEvidenceUpload);
    });

    it('postTypeOfAppeal should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'answer': 'yes' };
      res.redirect = sandbox.stub().throws(error);
      postSupportingEvidencePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
