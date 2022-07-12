import express, { NextFunction, Request, Response } from 'express';
import { setupHearingApplicationControllers, validate } from '../../../../../app/controllers/make-application/hearing-requests/setup-hearing-application-controllers';
import { paths } from '../../../../../app/paths';
import { DocumentManagementService } from '../../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: []
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

  describe('setupHearingApplicationTypeController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingApplicationControllers(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.expedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.transfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceTransfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceTransfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceDeleteFile);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerTransfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.requestSent);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.expedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.transfer);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceTransfer);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUploadFile);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerTransfer);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(paths.makeApplication.provideSupportingEvidenceExpedite)(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(paths.makeApplication.provideSupportingEvidenceExpedite)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.makeApplication.provideSupportingEvidenceExpedite}?error=anError`);
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate(paths.makeApplication.provideSupportingEvidenceExpedite)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
