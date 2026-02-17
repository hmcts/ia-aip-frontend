import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
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
  let next: sinon.SinonStub;
  const evidenceExample: Evidence = {
    fileId: 'someUUID',
    name: 'filename'
  };
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let uploadStub: sinon.SinonStub;
  let deleteStub: sinon.SinonStub;

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
      } as Partial<session.Session>,
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

    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      locals: sandbox.stub(),
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub
    } as Partial<UpdateAppealService>;
    uploadStub = sandbox.stub();
    deleteStub = sandbox.stub();
    next = sandbox.stub();
    documentManagementService = { uploadFile: uploadStub, deleteFile: deleteStub };
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
      expect(routerGetStub.calledWith(paths.appealStarted.appealLate, middleware)).to.equal(true);
      expect(routerPostStub.calledWith(paths.appealStarted.appealLate, middleware)).to.equal(true);
    });
  });

  describe('getAppealLate', () => {
    it('should render home-office-letter-sent.njk', () => {
      getAppealLate(req as Request, res as Response, next);
      expect(renderStub.calledWith('appeal-application/home-office/appeal-late.njk')).to.equal(true);
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getAppealLate(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      expect(redirectStub.calledWith(paths.common.overview)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          lateAppeal
        }
      } as Appeal);

      documentManagementService.uploadFile = uploadStub.returns(documentUploadResponse);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.lateAppeal.reason).to.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.deep.equal(evidence);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          lateAppeal
        }
      } as Appeal);
      documentManagementService.uploadFile = uploadStub.returns(documentUploadResponse);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(deleteStub.calledWith(req, evidenceExample.fileId)).to.equal(true);
      expect(uploadStub.calledWith(req)).to.equal(true);
      expect(req.session.appeal.application.lateAppeal.reason).to.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidence).to.deep.equal(evidence);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          lateAppeal
        }
      } as Appeal);
      documentManagementService.uploadFile = uploadStub.returns(documentUploadResponse);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
    });
    it('Should display validation error LIMIT_FILE_SIZE and render appeal-application/home-office/appeal-late.njk', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as 0.001MB
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'The selected file must be smaller than 0.001MB'
      };
      req.body['appeal-late'] = 'My explanation why am late';
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;
      res.locals.errorCode = 'fileTooLarge';
      req.session.appeal.appealOutOfCountry = 'Yes';

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: 'My explanation why am late',
        evidence: evidenceExample,
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.appealStarted.taskList,
        appealOutOfCountry: true
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render appeal-application/home-office/appeal-late.njk', async () => {
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };
      req.body['appeal-late'] = 'My explanation why am late';
      res.locals.errorCode = 'incorrectFormat';
      req.session.appeal.appealOutOfCountry = 'Yes';

      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: 'My explanation why am late',
        evidence: null,
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        previousPage: paths.appealStarted.taskList,
        appealOutOfCountry: true
      });
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      await postAppealLate(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      req.session.appeal.appealOutOfCountry = 'Yes';

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(deleteStub.calledWith(req, evidenceExample.fileId)).to.equal(true);
      expect(req.session.appeal.application.lateAppeal.evidence).to.equal(undefined);
      expect(renderStub).to.be.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLateReason: undefined,
        error: { 'appeal-late': expectedError },
        errorList: [ expectedError ],
        previousPage: paths.appealStarted.taskList,
        appealOutOfCountry: true
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

      expect(deleteStub.calledWith(req, evidenceExample.fileId)).to.equal(true);
      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.lateAppeal.evidence).to.equal(undefined);
      expect(redirectStub.called).to.equal(true);
    });

    it('postAppealLateDeleteFile should catch exception and call next with the error', async () => {
      req.session.appeal.application.lateAppeal.evidence = evidenceExample;

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      const error = new Error('an error');
      res.render = renderStub.throws(error);
      await postAppealLateDeleteFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
