import express, { NextFunction, Request, Response } from 'express';
import { setupAppealRequestControllers } from '../../../../../app/controllers/make-application/appeal-requests/setup-appeal-application-controllers';
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
          documentMap: [],
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

  describe('setupAppealRequestControllers', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupAppealRequestControllers(middleware, updateAppealService as UpdateAppealService);
      /* Withdraw */
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.withdraw);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceWithdraw);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceWithdraw);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerWithdraw);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.withdraw);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceWithdraw);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceWithdraw);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerWithdraw);
      /* Update Details*/
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.updateAppealDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceUpdateAppealDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateAppealDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerUpdateAppealDetails);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.updateAppealDetails);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateAppealDetails);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceUpdateAppealDetails);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerUpdateAppealDetails);
    });
  });
});
