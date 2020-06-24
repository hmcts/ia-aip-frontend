import express, { NextFunction, Request, Response } from 'express';
import {
  buildEvidencesList,
  getCheckAndSendPage,
  getYourAnswersPage,
  postCheckAndSendPage,
  setupClarifyingQuestionsCheckSendController
} from '../../../../app/controllers/clarifying-questions/check-and-send';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import * as summaryListUtils from '../../../../app/utils/summary-list';
import { nowIsoDate } from '../../../../app/utils/utils';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Clarifying Questions Check and Send controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let addSummaryRowStub: sinon.SinonStub;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
        answer: 'an answer to the question',
        dateResponded: nowIsoDate()
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues',
        answer: 'an answer to the question',
        dateResponded: nowIsoDate()
      }
    }
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
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
          draftClarifyingQuestionsAnswers: clarifyingQuestions
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    addSummaryRowStub = sandbox.stub(summaryListUtils, 'addSummaryRow');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupClarifyingQuestionsCheckSendController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupClarifyingQuestionsCheckSendController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.checkAndSend}`);
      expect(routerPostStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.checkAndSend}`);
    });
  });

  describe('getCheckAndSendPage', () => {
    it('should render CYA template page', () => {
      getCheckAndSendPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk');
    });

    it('should render CYA template page with evidences', () => {
      const evidences: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence = [ ...evidences ];
      req.session.appeal.draftClarifyingQuestionsAnswers[1].value.supportingEvidence = [ ...evidences ];
      const evidenceList = buildEvidencesList(evidences);
      getCheckAndSendPage(req as Request, res as Response, next);

      expect(addSummaryRowStub.thirdCall).to.have.been.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(':id', `1`),
        '<br>'
      );
      expect(addSummaryRowStub.getCall(4)).to.have.been.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        '',
        '<br>'
      );
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getCheckAndSendPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postCheckAndSendPage @only', () => {
    let appeal: Partial<Appeal>;
    beforeEach(() => {
      appeal = {
        clarifyingQuestionsAnswers: clarifyingQuestions
      };
      updateAppealService = {
        submitEventRefactored: sandbox.stub().returns({
          clarifyingQuestionsAnswers: clarifyingQuestions,
          appealStatus: 'newState'
        } as Appeal)
      } as Partial<UpdateAppealService>;
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should submit CQ and redirect to confirmation page', async () => {
      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.clarifyingQuestionsAnswers).to.eql(clarifyingQuestions);
      expect(req.session.appeal.draftClarifyingQuestionsAnswers).to.be.undefined;
      expect(req.session.appeal.appealStatus).to.be.equal('newState');
      expect(res.redirect).to.have.been.calledWith(paths.clarifyingQuestionsAnswersSubmitted.confirmation);
    });

    it('should validate and redirect to saveforLater', async () => {
      req.body.saveForLater = 'saveForLater';
      clarifyingQuestions[0].value.dateResponded = nowIsoDate();
      clarifyingQuestions[1].value.dateResponded = nowIsoDate();
      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);

      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getYourAnswersPage', () => {
    beforeEach(() => {
      req.session.appeal.draftClarifyingQuestionsAnswers = null;
      req.session.appeal.clarifyingQuestionsAnswers = clarifyingQuestions;
    });
    it('should render CYA template page', () => {
      getYourAnswersPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk');
    });

    it('should render CYA template page with evidences', () => {
      const evidences: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.clarifyingQuestionsAnswers[0].value.supportingEvidence = [ ...evidences ];
      req.session.appeal.clarifyingQuestionsAnswers[1].value.supportingEvidence = [ ...evidences ];
      const evidenceList = buildEvidencesList(evidences);
      getYourAnswersPage(req as Request, res as Response, next);

      expect(addSummaryRowStub.thirdCall).to.have.been.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        null,
        '<br>'
      );
      expect(addSummaryRowStub.getCall(4)).to.have.been.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        '',
        '<br>'
      );
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getYourAnswersPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
