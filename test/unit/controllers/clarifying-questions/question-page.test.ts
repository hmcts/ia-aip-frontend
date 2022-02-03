import express, { NextFunction, Request, Response } from 'express';
import {
  getClarifyingQuestionPage,
  postClarifyingQuestionPage,
  setupClarifyingQuestionPageController
} from '../../../../app/controllers/clarifying-questions/question-page';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { nowIsoDate } from '../../../../app/utils/utils';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Question-page controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
        directionId: 'directionId'
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues',
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
          application: {},
          draftClarifyingQuestionsAnswers: [ ...clarifyingQuestions ]
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupClarifyingQuestionPageController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupClarifyingQuestionPageController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.question}`);
      expect(routerPostStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.question}`);
    });
  });

  describe('getClarifyingQuestionPage', () => {
    it('should render question-page.njk page', () => {
      req.params.id = '1';
      const questionOrderNo = parseInt(req.params.id, 10) - 1;
      getClarifyingQuestionPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.called.calledWith(
        'clarifying-questions/question-page.njk',
        {
          previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
          pendingTimeExtension: false,
          question: {
            ...clarifyingQuestions[questionOrderNo],
            orderNo: req.params.id
          }
        }
      );
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getClarifyingQuestionPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postClarifyingQuestionPage', () => {
    const dummyAnswer: string = 'A dummy answer';
    let appeal: Partial<Appeal>;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal
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
    it('should fail validation and render question-page.njk page with errors', async () => {
      req.body.answer = '';
      req.params.id = '1';
      const questionOrderNo = parseInt(req.params.id, 10) - 1;
      const answerError: ValidationError = {
        href: '#answer',
        key: 'answer',
        text: i18n.validationErrors.clarifyingQuestions.emptyAnswer
      };
      await postClarifyingQuestionPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'clarifying-questions/question-page.njk',
        {
          previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
          question: {
            ...clarifyingQuestions[questionOrderNo],
            orderNo: req.params.id
          },
          errors: { 'answer': answerError },
          errorList: [ answerError ]
        }
      );
    });

    it('should pass validation and save answer and redirect to questions-list', async () => {
      req.body.answer = dummyAnswer;
      appeal.draftClarifyingQuestionsAnswers[0].value.answer = dummyAnswer;
      appeal.draftClarifyingQuestionsAnswers[0].value.dateResponded = nowIsoDate();
      req.params.id = '1';
      const questionOrderNo = parseInt(req.params.id, 10) - 1;
      await postClarifyingQuestionPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.draftClarifyingQuestionsAnswers[questionOrderNo].value.answer).to.be.eql(req.body.answer);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(new RegExp(':id'), req.params.id));

    });

    it('should validate and redirect to saveforLater', async () => {
      req.body.answer = dummyAnswer;
      req.params.id = '1';
      req.body.saveForLater = 'saveForLater';
      appeal.draftClarifyingQuestionsAnswers[0].value.answer = dummyAnswer;
      appeal.draftClarifyingQuestionsAnswers[0].value.dateResponded = nowIsoDate();
      const questionOrderNo = parseInt(req.params.id, 10) - 1;
      await postClarifyingQuestionPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.draftClarifyingQuestionsAnswers[questionOrderNo].value.answer).to.be.eql(req.body.answer);
      expect(res.redirect).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview + '?saved');
    });

    it('should call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postClarifyingQuestionPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
