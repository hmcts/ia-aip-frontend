import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { CQ_NOTHING_ELSE } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage, nowIsoDate } from '../../utils/utils';
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
      if (!shouldValidateWhenSaveForLater(req.body, 'anything-else','saveForLater')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
      const anythingElseQuestion: ClarifyingQuestion<Evidence> = draftClarifyingQuestionsAnswers.pop();
      const validationErrors = textAreaValidation(req.body['anything-else'], 'anything-else', i18n.validationErrors.clarifyingQuestions.anythingElseEmptyAnswer);
      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
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
      anythingElseQuestion.value.dateResponded = nowIsoDate();
      draftClarifyingQuestionsAnswers.push(anythingElseQuestion);
      const appeal: Appeal = {
        ...req.session.appeal,
        draftClarifyingQuestionsAnswers: [
          ...draftClarifyingQuestionsAnswers
        ]
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(
        editingMode,
        paths.appealStarted.checkAndSend,
        req.body.saveForLater,
        paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(':id', `${draftClarifyingQuestionsAnswers.length}`)
      );
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function setupCQAnythingElseAnswerController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router: Router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage, middleware, getAnythingElseAnswerPage);
  router.post(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage, middleware, postAnythingElseAnswerPage(updateAppealService));
  return router;
}

export {
  getAnythingElseAnswerPage,
  postAnythingElseAnswerPage,
  setupCQAnythingElseAnswerController
};
