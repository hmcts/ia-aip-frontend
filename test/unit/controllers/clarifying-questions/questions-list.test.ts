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
  const clarifyingQuestions: ClarifyingQuestion[] = [
    {
      id: 'id1',
      value: {
        question: 'Tell us more about your children'
      }
    },
    {
      id: 'id2',
      value: {
        question: 'Tell us more about your health issues'
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
          questions: [ ...clarifyingQuestions ],
          questionsCompleted: false
        }
      );
    });

    it('should render questions-list.njk page with questionsCompleted flag to true', () => {
      const questionsAnswered: ClarifyingQuestion[] = clarifyingQuestions.map(question => {
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
          questions: [ ...questionsAnswered ],
          questionsCompleted: true
        }
      );
    });
  });
});
