import express, { NextFunction, Request, Response } from 'express';
import { validate } from '../../../../app/controllers/appeal-application/upload-local-authority-letter';
import {
  deleteLocalAuthorityLetterRefund,
  getLocalAuthorityLetterRefund,
  postLocalAuthorityLetterRefund,
  SetupLocalAuthorityLetterRefundController,
  uploadLocalAuthorityLetterRefund
} from '../../../../app/controllers/ask-for-fee-remission/upload-local-authority-letter-refund';
import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import Logger from '../../../../app/utils/logger';
import { createStructuredError } from '../../../../app/utils/validations/fields-validations';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Local authority letter refund Controller', function () {
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

  describe('SetupLocalAuthorityLetterRefundController', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];
      new SetupLocalAuthorityLetterRefundController().initialise(middleware, updateAppealService, documentManagementService as DocumentManagementService);

      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.localAuthorityLetterRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.localAuthorityLetterRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.localAuthorityLetterUploadRefund);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.localAuthorityLetterDeleteRefund);
    });

    it('should render template', async () => {
      await getLocalAuthorityLetterRefund(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/upload-local-authority-letter.njk');
    });

    it('should render template and update edit flag in session', async () => {
      req.query = { 'edit': '' };
      await getLocalAuthorityLetterRefund(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/upload-local-authority-letter.njk');
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
    });

    it('should render template with validation errors', async () => {
      req.query = { error: 'error' };
      const validationErrors = { uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`]) };
      await getLocalAuthorityLetterRefund(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/upload-local-authority-letter.njk', {
        title: i18n.pages.uploadLocalAuthorityLetter.title,
        evidenceListTitle: i18n.pages.uploadLocalAuthorityLetter.uploadedFileTitle,
        formSubmitAction: paths.appealSubmitted.localAuthorityLetterRefund,
        evidenceUploadAction: paths.appealSubmitted.localAuthorityLetterUploadRefund,
        evidences: [],
        evidenceCTA: paths.appealSubmitted.localAuthorityLetterDeleteRefund,
        previousPage: paths.appealSubmitted.feeSupportRefund,
        saveForLaterCTA: paths.common.overview,
        error: validationErrors,
        errorList: Object.values(validationErrors),
        continueCancelButtons: true
      });
    });

    it('should redirect to \'/local-authority-letter-refund\' if no letter uploaded', async () => {
      await postLocalAuthorityLetterRefund()(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.appealSubmitted.localAuthorityLetterRefund}?error=noFileSelected`);
    });

    it('should redirect to \'/about-appeal\' if local authority letter upload present and not in editing mode', async () => {
      req.session.appeal.application.lateLocalAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetterRefund()(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
    });

    it('should redirect to \'/check-answers\' if local authority letter upload present and in editing mode', async () => {
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.lateLocalAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetterRefund()(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
    });

    it('should call next if no multer errors', () => {
      validate(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect to \'/upload-local-authority-letter-refund\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should upload a file', async () => {
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadLocalAuthorityLetterRefund(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.uploadFile).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.localAuthorityLetterRefund);
    });

    it('should redirect to \'/upload-local-authority-letter\' with no file selected error', async () => {
      await uploadLocalAuthorityLetterRefund(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.appealSubmitted.localAuthorityLetterRefund}?error=noFileSelected`);
    });

    it('should delete an evidence', async () => {
      req.session.appeal.application.lateLocalAuthorityLetters = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteLocalAuthorityLetterRefund(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.localAuthorityLetterRefund);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.lateLocalAuthorityLetters = [{ fileId: 'id', name: 'name' } as Evidence];
      await postLocalAuthorityLetterRefund()(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('When Flag is switched off expectations', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(false);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await getLocalAuthorityLetterRefund(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postLocalAuthorityLetterRefund()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadLocalAuthorityLetterRefund(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });

    it('should catch an error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.application.lateLocalAuthorityLetters = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteLocalAuthorityLetterRefund(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

});
