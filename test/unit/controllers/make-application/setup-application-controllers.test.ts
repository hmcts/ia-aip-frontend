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
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  let redirectStub: sinon.SinonStub;

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
    redirectStub = sandbox.stub();
    res = {
      render: sandbox.stub(),
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceDeleteFile)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.requestSent)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceUploadFile)).to.equal(true);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      req.session.appeal.makeAnApplicationTypes.value.code = 'expedite';
      validate('provideSupportingEvidence')(req as Request, res as Response, next);

      expect(next.called).to.equal(true);
    });

    it('should redirect with error code', async () => {
      req.session.appeal.makeAnApplicationTypes.value.code = 'expedite';
      res.locals.errorCode = 'anError';
      validate('provideSupportingEvidence')(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.makeApplication.provideSupportingEvidenceExpedite}?error=anError`)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      req.session.appeal.makeAnApplicationTypes.value.code = 'expedite';
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      validate('provideSupportingEvidence')(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
