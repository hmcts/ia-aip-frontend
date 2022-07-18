import express, { NextFunction, Request, Response } from 'express';
import { setupHearingApplicationControllers } from '../../../../../app/controllers/make-application/hearing-requests/setup-hearing-application-controllers';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

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
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingApplicationTypeController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingApplicationControllers(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.expedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.adjourn);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.transfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.updateHearingRequirements);

      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceAdjourn);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceTransfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceUpdateHearingRequirements);

      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceAdjourn);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceTransfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateHearingRequirements);

      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerExpedite);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerAdjourn);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerTransfer);
      expect(routerGetStub).to.have.been.calledWith(paths.makeApplication.checkAnswerUpdateHearingRequirements);

      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.expedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.adjourn);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.transfer);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.updateHearingRequirements);

      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceAdjourn);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceTransfer);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateHearingRequirements);

      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceAdjourn);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceTransfer);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.supportingEvidenceUpdateHearingRequirements);

      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerExpedite);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerAdjourn);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerTransfer);
      expect(routerPostStub).to.have.been.calledWith(paths.makeApplication.checkAnswerUpdateHearingRequirements);
    });
  });
});
