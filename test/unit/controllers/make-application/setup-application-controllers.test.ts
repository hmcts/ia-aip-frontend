import express, { NextFunction, Request, Response } from 'express';
import { setupMakeApplicationControllers, validate } from '../../../../app/controllers/make-application/setup-application-controllers';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Appeal application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          makeAnApplicationTypes: {
            value: {}
          }
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = {
      submitEventRefactored: sandbox.stub(),
      updateAppealService: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupMakeApplicationControllers', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupMakeApplicationControllers(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceDeleteFile);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.requestSent);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUploadFile);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      req.session.appeal.makeAnApplicationTypes.value.code = 'expedite';
      validate('provideSupportingEvidence')(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect with error code', async () => {
      req.session.appeal.makeAnApplicationTypes.value.code = 'expedite';
      res.locals.errorCode = 'anError';
      validate('provideSupportingEvidence')(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.makeApplication.provideSupportingEvidenceExpedite}?error=anError`);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.makeAnApplicationTypes.value.code = 'expedite';
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate('provideSupportingEvidence')(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
