import { NextFunction, Request, Response } from 'express';
import {
  getAppealLate,
  postAppealLate,
  postAppealLateDeleteFile,
  setupOutOfTimeController
} from '../../../app/controllers/appeal-application/out-of-time';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Out of time controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  let next: NextFunction;
  const evidenceExample: Evidence = {
    fileId: 'someUUID',
    name: 'filename'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            lateAppeal: {}
          },
          reasonsForAppeal: {},
          hearingRequirements: {}
        } as Appeal
      } as Partial<Express.Session>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {}
      } as any
    } as Partial<Request>;

    res = {
      locals: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() };
    documentManagementService = { uploadFile: sandbox.stub(), deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHomeOfficeDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const updateAppealServiceDependency = updateAppealService as UpdateAppealService;
      const documentManagementServiceDependency = documentManagementService as DocumentManagementService;
      setupOutOfTimeController({
        updateAppealService: updateAppealServiceDependency,
        documentManagementService: documentManagementServiceDependency
      });
      expect(routerGetStub).to.have.been.calledWith(paths.homeOffice.appealLate);
      expect(routerPostStub).to.have.been.calledWith(paths.homeOffice.appealLate);
    });
  });

  describe('getAppealLate', () => {
    it('should render home-office-letter-sent.njk', () => {
      getAppealLate(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk');
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getAppealLate(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAppealLate', () => {
    const file = {
      originalname: 'file.png',
      mimetype: 'type'
    };

    const evidence: Evidence = {
      name: file.originalname,
      fileId: 'someUUID'
    };

    it('should not validate when save for later and redirect to overview', async () => {
      req.body = {
        'appeal-late': '',
        'saveForLater': 'saveForLater'
      };

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.overview);
    });

    it('should validate and upload a file and redirect to check and send page', async () => {
      const whyAmLate = 'My explanation why am late';
      req.body['appeal-late'] = whyAmLate;
      req.file = file as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.lateAppeal.reason).to.be.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.deep.equal(evidence);
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
    });

    it('should validate, delete previous evidence, upload new evidence and redirect to check and send page', async () => {
      const whyAmLate = 'My explanation why am late';

      req.body['appeal-late'] = whyAmLate;
      req.file = file as Express.Multer.File;
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, documentMap.url);
      expect(documentManagementService.uploadFile).to.have.been.calledWith(req);
      expect(req.session.appeal.application.lateAppeal.reason).to.be.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.deep.equal(evidence);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
    });

    it('when in edit mode should validate and redirect to CYA and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body['appeal-late'] = 'My explanation why am late';
      req.file = file as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);

    });
    it('Should display validation error LIMIT_FILE_SIZE and render appeal-application/home-office/appeal-late.njk', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as 0.001MB
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be smaller than 0.001MB'
      };
      req.body['appeal-late'] = 'My explanation why am late';
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;
      res.locals.multerError = expectedError.text;

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: 'My explanation why am late',
        evidence: evidenceExample,
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.taskList
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render appeal-application/home-office/appeal-late.njk', async () => {
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };
      req.body['appeal-late'] = 'My explanation why am late';
      res.locals.multerError = expectedError.text;

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: 'My explanation why am late',
        evidence: null,
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.taskList
      });
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAppealLateDeleteFile', () => {

    it('Should delete successfully when click on delete link, fail validation and render with errors', async () => {
      const expectedError: ValidationError = {
        href: '#appeal-late',
        key: 'appeal-late',
        text: i18n.validationErrors.emptyReasonAppealIsLate
      };
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, documentMap.url);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.undefined;
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: undefined,
        error: { 'appeal-late': expectedError },
        errorList: [ expectedError ],
        previousPage: paths.taskList
      });
    });

    it('Should delete successfully when click on delete link, pass validation and redirect to appeal late page', async () => {
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.body['appeal-late'] = 'a reason for being late';
      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, documentMap.url);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.undefined;
      expect(res.redirect).to.have.been.called;
    });

    it('postAppealLateDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
