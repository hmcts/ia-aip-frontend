import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { CQ_NOTHING_ELSE } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

function getAnythingElseQuestionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const questionsLength: number = req.session.appeal.draftClarifyingQuestionsAnswers.length;
    const anythingElseQuestion: ClarifyingQuestion<Evidence> = { ...req.session.appeal.draftClarifyingQuestionsAnswers[questionsLength - 1] };
    const options = [
      {
        value: true,
        text: 'Yes'
      },
      {
        value: false,
        text: 'No'
      }
    ];
    res.render('templates/radio-question-page.njk', {
      previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
      pageTitle: anythingElseQuestion.value.question,
      formAction: paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage,
      question: {
        title: anythingElseQuestion.value.question,
        hint: i18n.pages.clarifyingQuestionAnythingElseQuestion.hint,
        options
      }
    });
  } catch (e) {
    next(e);
  }
}

function postAnythingElseQuestionPage(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
      const anythingElseQuestion: ClarifyingQuestion<Evidence> = draftClarifyingQuestionsAnswers.pop();
      const validationError = yesOrNoRequiredValidation(req.body, 'Select Yes if you want to tell us anything else about your case');
      if (validationError) {
        const options = [
          {
            value: true,
            text: 'Yes'
          },
          {
            value: false,
            text: 'No'
          }
        ];
        return res.render('templates/radio-question-page.njk', {
          previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
          pageTitle: 'the title',
          formAction: paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage,
          question: {
            title: anythingElseQuestion.value.question,
            hint: i18n.pages.clarifyingQuestionAnythingElseQuestion.hint,
            options
          },
          errorList: Object.values(validationError),
          error: validationError
        });
      } else {
        const anythingElse = req.body['answer'];
        if (anythingElse === 'true') {
          res.redirect(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage);
        } else {
          if (anythingElseQuestion.value.supportingEvidence) {
            anythingElseQuestion.value.supportingEvidence.forEach(async (evidence: Evidence) => {
              const targetUrl: string = documentIdToDocStoreUrl(evidence.id, req.session.appeal.documentMap);
              await documentManagementService.deleteFile(req, targetUrl);
            });
          }
          anythingElseQuestion.value = {
            ...anythingElseQuestion.value,
            answer: CQ_NOTHING_ELSE,
            supportingEvidence: []
          };
          const appeal: Appeal = {
            ...req.session.appeal,
            draftClarifyingQuestionsAnswers: [
              ...draftClarifyingQuestionsAnswers,
              anythingElseQuestion
            ]
          };
          const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
          req.session.appeal = {
            ...req.session.appeal,
            ...appealUpdated
          };
          res.redirect(paths.awaitingClarifyingQuestionsAnswers.questionsList);
        }
      }
    } catch (e) {
      next(e);
    }
  };
}

function setupCQAnythingElseQuestionController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router: Router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage, middleware, getAnythingElseQuestionPage);
  router.post(paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage, middleware, postAnythingElseQuestionPage(updateAppealService, documentManagementService));
  return router;
}

export {
  getAnythingElseQuestionPage,
  postAnythingElseQuestionPage,
  setupCQAnythingElseQuestionController
};
