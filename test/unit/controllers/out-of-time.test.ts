import { NextFunction, Request, Response } from 'express';
import {
  getAppealLate,
  getAppealLateDeleteFile,
  postAppealLate,
  setupOutOfTimeController
} from '../../../app/controllers/appeal-application/out-of-time';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Out of time controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  let next: NextFunction;

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

    const fileObject = {
      id: `0000-${file.originalname}`,
      name: file.originalname,
      url: '#'
    };

    it('should validate and upload a file and redirect to check and send page', async () => {
      const whyAmLate = 'My explanation why am late';
      req.body['appeal-late'] = whyAmLate;
      req.file = file as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        id: '0000-file.png',
        url: '#',
        name: 'file.png'
      };

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.lateAppeal.reason).to.be.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.deep.equal(fileObject);
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
    });

    it('when in edit mode should validate and redirect to CYA and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body['appeal-late'] = 'My explanation why am late';
      req.file = file as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        id: '0000-file.png',
        url: 'someUrlToTheFile',
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
      res.locals.multerError = expectedError.text;

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: 'My explanation why am late',
        evidence: null,
        evidenceCTA: paths.homeOffice.deleteEvidence,
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
        evidenceCTA: paths.homeOffice.deleteEvidence,
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

  describe('getAppealLateDeleteFile', () => {

    it('Should delete successfully when click on delete link and redirect to the appeal late page', async () => {
      req.session.appeal.application.lateAppeal.evidence = {
        id: 'someEvidenceId',
        url: 'someUrlToTheFile',
        name: 'name.png'
      };

      await getAppealLateDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.undefined;
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.homeOffice.appealLate);
    });

    it('getAppealLateDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.application.lateAppeal.evidence = {
        id: 'someEvidenceId',
        url: 'someUrlToTheFile',
        name: 'name.png'
      };

      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await getAppealLateDeleteFile(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
