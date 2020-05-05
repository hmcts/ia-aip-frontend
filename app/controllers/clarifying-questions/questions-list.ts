import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';

function getQuestionsList(req: Request, res: Response, next: NextFunction) {
  const questions = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
  const questionsCompleted: boolean = questions.reduce((acc, question) => acc && !!question.value.answer, true);
  res.render('clarifying-questions/questions-list.njk', {
    previousPage: paths.common.overview,
    questions,
    questionsCompleted
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
