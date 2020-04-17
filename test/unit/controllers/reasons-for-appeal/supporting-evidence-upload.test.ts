import { NextFunction, Request, Response } from 'express';
import {
  getSupportingEvidenceDeleteFile,
  getSupportingEvidenceUploadPage,
  postSupportingEvidenceUploadFile,
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
  const someEvidences: Evidence[] = [
    {
      fileId: 'someUUID',
      name: 'name.png'
    }
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      session: {
        appeal: {
          application: {
            contactDetails: {}
          },
          reasonsForAppeal: {}
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
      locals: sandbox.spy(),
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
      const middleware = [];
      setupReasonsForAppealController(middleware, deps);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceUpload, middleware);
      expect(routerPOSTStub).to.have.been.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceUploadFile, middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile, middleware);
    });
  });

  describe('getSupportingEvidenceUploadPage', () => {
    it('should render reasons-for-appeal/supporting-evidence-upload-page.njk', () => {
      const evidences: Evidence[] = [];
      req.session.appeal.reasonsForAppeal.evidences = evidences;

      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        evidences: Object.values(evidences),
        evidenceCTA: paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile,
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('should render reasons-for-appeal/supporting-evidence-upload-page.njk with saved evidences', () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        evidences: someEvidences,
        evidenceCTA: paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile,
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('getSupportingEvidenceUploadPage should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postSupportingEvidenceUploadFile', () => {

    it('Should display validation error when no file has been selected and render reasons-for-appeal/reasons-for-appeal-upload.njk ', async () => {
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'Select a file'
      };

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidences: [],
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render reasons-for-appeal/reasons-for-appeal-upload.njk ', async () => {
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };

      res.locals.multerError = expectedError.text;

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidences: [],
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should display validation error LIMIT_FILE_SIZE and render reasons-for-appeal/reasons-for-appeal-upload.njk ', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as 0.001MB
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be smaller than 0.001MB'
      };

      res.locals.multerError = expectedError.text;

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidences: [],
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should succeed render reasons-for-appeal/reasons-for-appeal-upload.njk with errors ', async () => {

      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Partial<Express.Multer.File>;

      req.file = mockFile as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceUpload);
    });

    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';

      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getSupportingEvidenceDeleteFile', () => {

    it('Should delete successfully when click on delete link and redirect to the upload-page page', async () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(req.session.appeal.reasonsForAppeal.evidences).to.not.haveOwnProperty('someUUID');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceUpload);
    });

    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';

      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
})
;
