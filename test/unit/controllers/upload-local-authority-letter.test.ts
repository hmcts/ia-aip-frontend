import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
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

  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let uploadStub: sinon.SinonStub;
  let deleteStub: sinon.SinonStub;
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
      } as Partial<session.Session>,
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
    uploadStub = sandbox.stub();
    deleteStub = sandbox.stub();
    documentManagementService = {
      uploadFile: uploadStub,
      deleteFile: deleteStub
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
      expect(routerGetStub.calledWith(paths.appealStarted.localAuthorityLetter)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.localAuthorityLetterDelete)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.localAuthorityLetter)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.localAuthorityLetterUpload)).to.equal(true);
    });
  });

  describe('postLocalAuthorityLetter', () => {
    it('should redirect to \'/local-authority-letter\' if no home office letter upload', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.appealStarted.localAuthorityLetter}?error=noFileSelected`)).to.equal(true);
    });

    it('should redirect to \'/about-appeal\' if local authority letter upload present and not in editing mode', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should redirect to \'/check-answers\' if local authority letter upload present and in editing mode', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetter(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(req as Request, res as Response, next);

      expect(next.called).to.equal(true);
    });

    it('should redirect to \'/upload-local-authority-letter\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(req as Request, res as Response, next);

      expect(redirectStub.called).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      validate(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
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

      expect(uploadStub.called).to.equal(true);
      expect(submitRefactoredStub.called).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.localAuthorityLetter)).to.equal(true);
    });

    it('should redirect to \'/upload-local-authority-letter\' with no file selected error', async () => {
      await uploadLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.appealStarted.localAuthorityLetter}?error=noFileSelected`)).to.equal(true);
    });

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('deleteLocalAuthorityLetter', () => {
    it('should delete an evidence', async () => {
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(deleteStub.called).to.equal(true);
      expect(submitRefactoredStub.called).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.localAuthorityLetter)).to.equal(true);
    });

    it('should catch an error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      req.session.appeal.application.localAuthorityLetters = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteLocalAuthorityLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
