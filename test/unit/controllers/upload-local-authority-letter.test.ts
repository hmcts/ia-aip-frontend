import express, { NextFunction, Request, Response } from 'express';
import {
  deleteLocalAuthorityLetter,
  postLocalAuthorityLetter,
  SetupLocalAuthorityLetterController,
  uploadLocalAuthorityLetter,
  validate
} from '../../../app/controllers/appeal-application/upload-local-authority-letter';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Local authority letter', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      query: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      session: {
        appeal: {
          application: {
            personalDetails: {}
          }
        } as Appeal
      } as Partial<Express.Session>,
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy(),
      locals: {}
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
    documentManagementService = {
      uploadFile: sandbox.stub(),
      deleteFile: sandbox.stub()
    } as Partial<DocumentManagementService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('SetupLocalAuthorityLetterController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];
      new SetupLocalAuthorityLetterController().initialise(middleware, updateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.localAuthorityLetter);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.localAuthorityLetterDelete);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.localAuthorityLetter);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.localAuthorityLetterUpload);
    });
  });

  describe('postLocalAuthorityLetter', () => {
    it('should redirect to \'/local-authority-letter\' if no home office letter upload', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.appealStarted.localAuthorityLetter}?error=noFileSelected`);
    });

    it('should redirect to \'/about-appeal\' if local authority letter upload present and not in editing mode', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('should redirect to \'/check-answers\' if local authority letter upload present and in editing mode', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect to \'/upload-local-authority-letter\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('uploadLocalAuthorityLetter', () => {
    it('should upload a file', async () => {
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.uploadFile).to.have.been.called;
      expect(updateAppealService.submitEventRefactored).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.localAuthorityLetter);
    });

    it('should redirect to \'/upload-local-authority-letter\' with no file selected error', async () => {
      await uploadLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.appealStarted.localAuthorityLetter}?error=noFileSelected`);
    });

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('deleteLocalAuthorityLetter', () => {
    it('should delete an evidence', async () => {
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.called;
      expect(updateAppealService.submitEventRefactored).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.localAuthorityLetter);
    });

    it('should catch an error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
