import config from 'config';
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
import { asBooleanValue } from '../../../../app/utils/utils';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Supporting Evidence Upload Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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

    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      locals: sandbox.spy(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceUpload, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceUploadFile, middleware)).to.equal(true);
      expect(routerGetStub.calledWith(paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile, middleware)).to.equal(true);
    });
  });

  describe('getSupportingEvidenceUploadPage', () => {
    it('should render reasons-for-appeal/supporting-evidence-upload-page.njk', () => {
      const evidences: Evidence[] = [];
      req.session.appeal.reasonsForAppeal.evidences = evidences;

      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(renderStub).to.be.calledOnceWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        evidences: Object.values(evidences),
        evidenceCTA: paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile,
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
      });
    });

    it('should render reasons-for-appeal/supporting-evidence-upload-page.njk with saved evidences', () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(renderStub).to.be.calledOnceWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        evidences: someEvidences,
        evidenceCTA: paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile,
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
      });
    });

    it('getSupportingEvidenceUploadPage should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postSupportingEvidenceUploadFile', () => {

    it('Should display validation error when no file has been selected and render reasons-for-appeal/reasons-for-appeal-upload.njk ', async () => {
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'Select a file'
      };

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidences: [],
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render reasons-for-appeal/reasons-for-appeal-upload.njk ', async () => {
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };

      res.locals.errorCode = 'incorrectFormat';

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidences: [],
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
      });
    });

    it('Should display validation error LIMIT_FILE_SIZE and render reasons-for-appeal/reasons-for-appeal-upload.njk ', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as 0.001MB
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'The selected file must be smaller than 0.001MB'
      };

      res.locals.errorCode = 'fileTooLarge';

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('reasons-for-appeal/supporting-evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidences: [],
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: asBooleanValue(config.get('features.askForMoreTime'))
      });
    });

    it('Should succeed render reasons-for-appeal/reasons-for-appeal-upload.njk with errors ', async () => {

      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Express.Multer.File;

      req.file = mockFile;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postSupportingEvidenceUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.awaitingReasonsForAppeal.supportingEvidenceUpload)).to.equal(true);
    });

    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';

      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      expect(redirectStub.calledOnceWith(paths.awaitingReasonsForAppeal.supportingEvidenceUpload)).to.equal(true);
    });

    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.reasonsForAppeal.evidences = someEvidences;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';

      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
})
;
