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
  let next: sinon.SinonStub;
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

  describe('setupAppealRequestControllers', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupAppealRequestControllers(middleware, updateAppealService as UpdateAppealService);

      /* Withdraw */
      expect(routerGetStub.calledWith(paths.makeApplication.withdraw)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceWithdraw)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceWithdraw)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerWithdraw)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.withdraw)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceWithdraw)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceWithdraw)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerWithdraw)).to.equal(true);

      /* Update Details */
      expect(routerGetStub.calledWith(paths.makeApplication.updateAppealDetails)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceUpdateAppealDetails)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateAppealDetails)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerUpdateAppealDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.updateAppealDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceUpdateAppealDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceUpdateAppealDetails)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerUpdateAppealDetails)).to.equal(true);

      /* Link or Unlink */
      expect(routerGetStub.calledWith(paths.makeApplication.linkOrUnlink)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceLinkOrUnlink)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceLinkOrUnlink)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerLinkOrUnlink)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.linkOrUnlink)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceLinkOrUnlink)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceLinkOrUnlink)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerLinkOrUnlink)).to.equal(true);

      /* Judge's Review */
      expect(routerGetStub.calledWith(paths.makeApplication.judgesReview)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceJudgesReview)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceJudgesReview)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerJudgesReview)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.judgesReview)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceJudgesReview)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceJudgesReview)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerJudgesReview)).to.equal(true);

      /* Something Else */
      expect(routerGetStub.calledWith(paths.makeApplication.other)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceOther)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceOther)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerOther)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.other)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceOther)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceOther)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerOther)).to.equal(true);

      /* Reinstate */
      expect(routerGetStub.calledWith(paths.makeApplication.reinstate)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceReinstate)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceReinstate)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerReinstate)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.reinstate)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceReinstate)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceReinstate)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerReinstate)).to.equal(true);

      /* Change Hearing Type */
      expect(routerGetStub.calledWith(paths.makeApplication.changeHearingType)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.supportingEvidenceChangeHearingType)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.provideSupportingEvidenceChangeHearingType)).to.equal(true);
      expect(routerGetStub.calledWith(paths.makeApplication.checkAnswerChangeHearingType)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.changeHearingType)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.provideSupportingEvidenceChangeHearingType)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.supportingEvidenceChangeHearingType)).to.equal(true);
      expect(routerPostStub.calledWith(paths.makeApplication.checkAnswerChangeHearingType)).to.equal(true);
    });
  });
});
