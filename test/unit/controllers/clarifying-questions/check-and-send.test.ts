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
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let addSummaryRowStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
        answer: 'an answer to the question',
        dateResponded: nowIsoDate(),
        directionId: 'directionId'
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues',
        answer: 'an answer to the question',
        dateResponded: nowIsoDate(),
        directionId: 'directionId'
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
    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.checkAndSend}`)).to.equal(true);
      expect(routerPostStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.checkAndSend}`)).to.equal(true);
    });
  });

  describe('getCheckAndSendPage', () => {
    it('should render CYA template page', () => {
      getCheckAndSendPage(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/check-and-send.njk')).to.equal(true);
    });

    it('should render CYA template page with evidences', () => {
      const editParam = '?edit';
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

      expect(addSummaryRowStub.thirdCall).to.be.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(':id', '1') + editParam,
        '<br>'
      );
      expect(addSummaryRowStub.getCall(4)).to.be.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        '',
        '<br>'
      );
      expect(renderStub.calledWith('templates/check-and-send.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getCheckAndSendPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postCheckAndSendPage', () => {
    let appeal: Partial<Appeal>;
    beforeEach(() => {
      appeal = {
        clarifyingQuestionsAnswers: clarifyingQuestions
      };
      updateAppealService = {
        submitEventRefactored: submitStub.returns({
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

      appeal.draftClarifyingQuestionsAnswers = [];
      expect(submitStub.calledWith(Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.clarifyingQuestionsAnswers).to.deep.equal(clarifyingQuestions);
      expect(req.session.appeal.draftClarifyingQuestionsAnswers).to.equal(undefined);
      expect(req.session.appeal.appealStatus).to.equal('newState');
      expect(redirectStub.calledWith(paths.common.clarifyingQuestionsAnswersSentConfirmation)).to.equal(true);
    });

    it('should validate and redirect to saveforLater', async () => {
      req.body.saveForLater = 'saveForLater';
      clarifyingQuestions[0].value.dateResponded = nowIsoDate();
      clarifyingQuestions[1].value.dateResponded = nowIsoDate();
      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);

      await postCheckAndSendPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getYourAnswersPage', () => {
    beforeEach(() => {
      req.session.appeal.draftClarifyingQuestionsAnswers = null;
      req.session.appeal.clarifyingQuestionsAnswers = clarifyingQuestions;
      req.params.id = 'directionId';
    });
    it('should render CYA template page @thisONe', () => {
      getYourAnswersPage(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/check-and-send.njk')).to.equal(true);
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

      expect(addSummaryRowStub.thirdCall).to.be.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        null,
        '<br>'
      );
      expect(addSummaryRowStub.getCall(4)).to.be.calledWith(
        i18n.common.cya.supportingEvidenceRowTitle,
        evidenceList,
        '',
        '<br>'
      );
      expect(renderStub.calledWith('templates/check-and-send.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getYourAnswersPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
