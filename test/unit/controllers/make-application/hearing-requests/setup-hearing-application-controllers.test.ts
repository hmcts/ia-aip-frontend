import express, { NextFunction, Request, Response } from 'express';
import { setupHearingApplicationControllers } from '../../../../../app/controllers/make-application/hearing-requests/setup-hearing-application-controllers';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
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
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.makeApplication.askChangeHearing)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.expedite)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.adjourn)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.transfer)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.updateHearingRequirements)).to.equal(true);

      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceExpedite)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceAdjourn)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceTransfer)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceUpdateHearingRequirements)).to.equal(true);

      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceAdjourn)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceTransfer)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateHearingRequirements)).to.equal(true);

      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerExpedite)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerAdjourn)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerTransfer)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerUpdateHearingRequirements)).to.equal(true);

      expect(routerPostStub.calledWith(paths.makeApplication.expedite)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.adjourn)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.transfer)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.askChangeHearing)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.updateHearingRequirements)).to.equal(true);

      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceExpedite)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceAdjourn)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceTransfer)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateHearingRequirements)).to.equal(true);

      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceExpedite)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceAdjourn)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceTransfer)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceUpdateHearingRequirements)).to.equal(true);

      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerExpedite)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerAdjourn)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerTransfer)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerUpdateHearingRequirements)).to.equal(true);
    });
  });
});
