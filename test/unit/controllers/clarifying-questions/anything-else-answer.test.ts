import express, { NextFunction, Request, Response } from 'express';
import { getAnythingElseAnswerPage, postAnythingElseAnswerPage, setupCQAnythingElseAnswerController } from '../../../../app/controllers/clarifying-questions/anything-else-answer';
import { postClarifyingQuestionPage } from '../../../../app/controllers/clarifying-questions/question-page';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Clarifying Questions: Anything else answer controller', () => {
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
        question: 'Tell us more about your children'
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues',
        answer: 'an answer to the question'
      }
    },
    {
      id: 'id3',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Anything else question'
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
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCQAnythingElseAnswerController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupCQAnythingElseAnswerController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage}`);
      expect(routerPostStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage}`);
    });
  });

  describe('getAnythingElseAnswerPage', () => {
    it('should render template', () => {
      getAnythingElseAnswerPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk');
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getAnythingElseAnswerPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAnythingElseAnswerPage', () => {
    let appeal: Appeal;
    const anythingElseAnswer: string = 'The answer to anything else question';
    beforeEach(() => {
      appeal = {
        ...req.session.appeal
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should fail validation and render template with errors', async () => {
      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk');
    });

    it('should validate and redirect to supporting evidence question page', async () => {
      req.body['anything-else'] = anythingElseAnswer;
      appeal.draftClarifyingQuestionsAnswers[2].value.answer = anythingElseAnswer;
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
        ...appeal,
        draftClarifyingQuestionsAnswers: [
          ...appeal.draftClarifyingQuestionsAnswers
        ]
      } as Appeal);
      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(':id', `3`));
    });

    it('should validate and redirect to overview page', async () => {
      req.body.saveForLater = 'saveForLater';
      req.body['anything-else'] = anythingElseAnswer;
      appeal.draftClarifyingQuestionsAnswers[2].value.answer = anythingElseAnswer;
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
        ...appeal,
        draftClarifyingQuestionsAnswers: [
          ...appeal.draftClarifyingQuestionsAnswers
        ]
      } as Appeal);
      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should not validate and render with errors', async () => {
      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.called;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
