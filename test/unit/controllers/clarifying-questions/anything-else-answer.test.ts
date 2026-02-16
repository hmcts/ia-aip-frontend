import express, { NextFunction, Request, Response } from 'express';
import { getAnythingElseAnswerPage, postAnythingElseAnswerPage, setupCQAnythingElseAnswerController } from '../../../../app/controllers/clarifying-questions/anything-else-answer';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Clarifying Questions: Anything else answer controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonSpy;
  let submit: sinon.SinonStub;
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
        answer: 'an answer to the question',
        directionId: 'directionId'
      }
    },
    {
      id: 'id3',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Anything else question',
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
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();
    submit = sandbox.stub();
    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
    updateAppealService = { submitEventRefactored: submit } as Partial<UpdateAppealService>;
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
      expect(routerGetStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage}`)).to.equal(true);
      expect(routerPostStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage}`)).to.equal(true);
    });
  });

  describe('getAnythingElseAnswerPage', () => {
    it('should render template', () => {
      getAnythingElseAnswerPage(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk')).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getAnythingElseAnswerPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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

      expect(renderStub.calledWith('templates/textarea-question-page.njk')).to.equal(true);
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

      expect(submit.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(':id', '3'))).to.equal(true);
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

      expect(submit.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should not validate and render with errors', async () => {
      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.called).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postAnythingElseAnswerPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
