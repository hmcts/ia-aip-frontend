import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../../paths';

function getQuestionsList(req: Request<Params>, res: Response, next: NextFunction) {
  const questions = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
  const anythingElseQuestion: ClarifyingQuestion<Evidence> = questions.pop();
  const questionsCompleted: boolean = questions.reduce((acc, question) => acc && !!question.value.answer, true);
  const anythingElseCompleted: boolean = !!anythingElseQuestion.value.answer;
  res.render('clarifying-questions/questions-list.njk', {
    previousPage: paths.common.overview,
    questions,
    questionsCompleted,
    anythingElseQuestion,
    anythingElseCompleted
  });
}

function setupClarifyingQuestionsListController(middleware: Middleware[]) {
  const router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.questionsList, middleware, getQuestionsList);
  return router;
}

export {
  getQuestionsList,
  setupClarifyingQuestionsListController
};
