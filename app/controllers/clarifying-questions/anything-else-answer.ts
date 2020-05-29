import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { CQ_NOTHING_ELSE } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { textAreaValidation } from '../../utils/validations/fields-validations';

function getAnythingElseAnswerPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { draftClarifyingQuestionsAnswers } = req.session.appeal;
    const anythingElseQuestion: ClarifyingQuestion<Evidence> = draftClarifyingQuestionsAnswers[draftClarifyingQuestionsAnswers.length - 1];
    res.render('templates/textarea-question-page.njk', {
      previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
      formAction: paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage,
      pageTitle: anythingElseQuestion.value.question,
      question: {
        name: 'anything-else',
        title: anythingElseQuestion.value.question,
        description: i18n.pages.clarifyingQuestionAnythingElseAnswer.description,
        hint: i18n.pages.clarifyingQuestionAnythingElseAnswer.hint,
        value: anythingElseQuestion.value.answer === CQ_NOTHING_ELSE ? '' : anythingElseQuestion.value.answer
      },
      supportingEvidence: true,
      timeExtensionAllowed: true
    });
  } catch (e) {
    next(e);
  }
}

function postAnythingElseAnswerPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { draftClarifyingQuestionsAnswers } = req.session.appeal;
      const anythingElseQuestion: ClarifyingQuestion<Evidence> = draftClarifyingQuestionsAnswers[draftClarifyingQuestionsAnswers.length - 1];
      const validationErrors = textAreaValidation(req.body['anything-else'], 'anything-else', i18n.validationErrors.clarifyingQuestions.anythingElseEmptyAnswer);
      if (validationErrors) {
        res.render('templates/textarea-question-page.njk', {
          previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
          formAction: paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage,
          pageTitle: anythingElseQuestion.value.question,
          question: {
            name: 'anything-else',
            title: anythingElseQuestion.value.question,
            description: i18n.pages.clarifyingQuestionAnythingElseAnswer.description,
            hint: i18n.pages.clarifyingQuestionAnythingElseAnswer.hint,
            value: anythingElseQuestion.value.answer
          },
          supportingEvidence: true,
          timeExtensionAllowed: true,
          errorList: Object.values(validationErrors),
          errors: validationErrors
        });
      }
      anythingElseQuestion.value.answer = req.body['anything-else'];
      await updateAppealService.submitEvent(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, req);
      res.redirect(paths.awaitingClarifyingQuestionsAnswers.questionsList);
    } catch (e) {
      next(e);
    }
  };
}

function setupCQAnythingElseAnswerController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router: Router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage, getAnythingElseAnswerPage);
  router.post(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage, postAnythingElseAnswerPage(updateAppealService));
  return router;
}

export {
  getAnythingElseAnswerPage,
  postAnythingElseAnswerPage,
  setupCQAnythingElseAnswerController
};
