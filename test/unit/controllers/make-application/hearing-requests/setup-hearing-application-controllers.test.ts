import express from 'express';
import { setupHearingApplicationControllers } from '../../../../../app/controllers/make-application/hearing-requests/setup-hearing-application-controllers';
import { paths } from '../../../../../app/paths';
import { DocumentManagementService } from '../../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
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
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceDeleteFile);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.requestSent);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.expedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUploadFile);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerExpedite);
    });
  });
});
