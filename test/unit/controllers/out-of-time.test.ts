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
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
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
    updateAppealService = { submitEventRefactored: sandbox.stub() };
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
      const middleware = [];
      setupOutOfTimeController(middleware, {
        updateAppealService: updateAppealServiceDependency,
        documentManagementService: documentManagementServiceDependency
      });
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.appealLate, middleware);
      expect(routerPostStub).to.have.been.calledWith(paths.appealStarted.appealLate, middleware);
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
    const whyAmLate = 'My explanation why am late';
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
      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should validate and upload a file and redirect to check and send page', async () => {
      req.body['appeal-late'] = whyAmLate;
      req.file = file as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      const lateAppeal: LateAppeal = {
        reason: whyAmLate,
        evidence: documentUploadResponse
      };
      const appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          lateAppeal
        }
      } as Appeal);

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.lateAppeal.reason).to.be.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.deep.equal(evidence);
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('should validate, delete previous evidence, upload new evidence and redirect to check and send page', async () => {
      req.body['appeal-late'] = whyAmLate;
      req.file = file as Express.Multer.File;
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      const lateAppeal: LateAppeal = {
        reason: whyAmLate,
        evidence: documentUploadResponse
      };
      const appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          lateAppeal
        }
      } as Appeal);
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, evidenceExample.fileId);
      expect(documentManagementService.uploadFile).to.have.been.calledWith(req);
      expect(req.session.appeal.application.lateAppeal.reason).to.be.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.deep.equal(evidence);
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('when in edit mode should validate and redirect to CYA and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body['appeal-late'] = 'My explanation why am late';
      req.file = file as Express.Multer.File;
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      const lateAppeal: LateAppeal = {
        reason: whyAmLate,
        evidence: documentUploadResponse
      };
      const appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          lateAppeal
        }
      } as Appeal);
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });
    it('Should display validation error LIMIT_FILE_SIZE and render appeal-application/home-office/appeal-late.njk', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as {{maxFileSizeInMb}}MB
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be smaller than {{maxFileSizeInMb}}MB'
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
        previousPage: paths.appealStarted.taskList,
        appealOutOfCountry: undefined,
        sentOrReceived: 'sent'
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render appeal-application/home-office/appeal-late.njk', async () => {
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be a {{ supportedFormats | join(\', \') }}'
      };
      req.body['appeal-late'] = 'My explanation why am late';
      res.locals.multerError = expectedError.text;

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: 'My explanation why am late',
        evidence: null,
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.appealStarted.taskList,
        appealOutOfCountry: undefined,
        sentOrReceived: 'sent'
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
        key: 'appeal-late',
        text: i18n.validationErrors.emptyReasonAppealIsLate,
        href: '#appeal-late'
      };
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, evidenceExample.fileId);
      expect(req.session.appeal.application.lateAppeal.evidence).to.be.undefined;
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: undefined,
        error: { 'appeal-late': expectedError },
        errorList: [ expectedError ],
        previousPage: paths.appealStarted.taskList,
        appealOutOfCountry: undefined,
        sentOrReceived: 'sent'
      });
    });

    it('Should delete successfully when click on delete link, pass validation and redirect to appeal late page', async () => {
      const whyAmLate = 'a reason for being late';
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];
      req.body['appeal-late'] = whyAmLate;
      const lateAppeal: LateAppeal = {
        reason: whyAmLate
      };
      const appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal
        }
      };
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
        application: {
          lateAppeal
        }
      } as Appeal);
      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, evidenceExample.fileId);
      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
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
