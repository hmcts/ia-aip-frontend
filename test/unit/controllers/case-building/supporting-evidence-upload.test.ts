import { NextFunction, Request, Response } from 'express';
import {
  getSupportingEvidenceDeleteFile,
  getSupportingEvidenceUploadPage,
  setupReasonsForAppealController
} from '../../../../app/controllers/case-building/reason-for-appeal';
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
      query: {},
      session: {
        appeal: {
          application: {
            contactDetails: {}
          },
          caseBuilding: {}
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
      expect(routerGetStub).to.have.been.calledWith(paths.reasonsForAppeal.supportingEvidenceUpload);
      expect(routerPOSTStub).to.have.been.calledWith(paths.reasonsForAppeal.supportingEvidenceUploadFile);
      expect(routerGetStub).to.have.been.calledWith(paths.reasonsForAppeal.supportingEvidenceDeleteFile);
    });
  });

  describe('getSupportingEvidenceUploadPage', () => {
    it('should render case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', () => {
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);
      const evidences = {};
      req.session.appeal.caseBuilding.evidences = evidences;

      expect(res.render).to.have.been.calledOnce.calledWith('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
        evidences: Object.values(evidences),
        evidenceCTA: paths.reasonsForAppeal.supportingEvidenceDeleteFile,
        previousPage: paths.reasonsForAppeal.decision
      });
    });

    it('should render case-building/reasons-for-appeal/supporting-evidence-upload-page.njk with saved evidences', () => {
      const evidences = {
        someEvidenceId: {
          id: 'someEvidenceId',
          url: 'someUrlToTheFile',
          name: 'name.png'
        }
      };

      req.session.appeal.caseBuilding.evidences = evidences;
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
        evidences: Object.values(evidences),
        evidenceCTA: paths.reasonsForAppeal.supportingEvidenceDeleteFile,
        previousPage: paths.reasonsForAppeal.decision
      });
    });

    it('getSupportingEvidenceUploadPage should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getSupportingEvidenceDeleteFile', () => {

    it('Should delete successfully when click on delete link and redirect to the upload-page page', async () => {
      req.session.appeal.caseBuilding.evidences = {
        someEvidenceId: {
          id: 'someEvidenceId',
          url: 'someUrlToTheFile',
          name: 'name.png'
        }
      };
      req.query['id'] = 'someEvidenceId';
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(req.session.appeal.caseBuilding.evidences).to.not.haveOwnProperty('someEvidenceId');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.reasonsForAppeal.supportingEvidenceUpload);
    });

    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.caseBuilding.evidences = {
        someEvidenceId: {
          id: 'someEvidenceId',
          url: 'someUrlToTheFile',
          name: 'name.png'
        }
      };
      req.query['id'] = 'someEvidenceId';

      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
