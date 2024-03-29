import express, { NextFunction, Request, Response } from 'express';
import {
  getQuestionsList,
  setupClarifyingQuestionsListController
} from '../../../../app/controllers/clarifying-questions/questions-list';
import { paths } from '../../../../app/paths';
import { expect, sinon } from '../../../utils/testUtils';

describe('Questions-list controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
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
      session: {
        appeal: {
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

  describe('setupClarifyingQuestionsListController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware: Middleware[] = [];

      setupClarifyingQuestionsListController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList);
    });
  });

  describe('getQuestionsList', () => {
    it('should render questions-list.njk page', () => {
      getQuestionsList(req as Request, res as Response, next);

      expect(res.render).to.have.been.called.calledWith(
        'clarifying-questions/questions-list.njk',
        {
          previousPage: paths.common.overview,
          questions: [ clarifyingQuestions[0] ],
          questionsCompleted: false,
          anythingElseQuestion: clarifyingQuestions[1],
          anythingElseCompleted: false
        }
      );
    });

    it('should render questions-list.njk page with questionsCompleted flag to true', () => {
      const questionsAnswered: ClarifyingQuestion<Evidence>[] = clarifyingQuestions.map(question => {
        return {
          ...question,
          value: {
            ...question.value,
            answer: 'This is a generic answer for every clarifying question'
          }
        };
      });
      req.session.appeal.draftClarifyingQuestionsAnswers = [ ...questionsAnswered ];
      getQuestionsList(req as Request, res as Response, next);

      expect(res.render).to.have.been.called.calledWith(
        'clarifying-questions/questions-list.njk',
        {
          previousPage: paths.common.overview,
          questions: [ questionsAnswered[0] ],
          questionsCompleted: true,
          anythingElseQuestion: questionsAnswered[1],
          anythingElseCompleted: true
        }
      );
    });
  });
});
