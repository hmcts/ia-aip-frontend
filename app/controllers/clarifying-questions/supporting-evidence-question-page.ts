import { NextFunction, Request, Response, Router } from 'express';
import { Events } from '../../../app/data/events';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';
import { documentIdToDocStoreUrl } from '../../utils/utils';

function getSupportingEvidenceQuestionPage(req: Request, res: Response, next: NextFunction) {
  try {
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
    res.render('upload-evidence/supporting-evidence-question-page.njk', {
      formAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(new RegExp(`:id`), req.params.id),
      question: {
        name: 'answer',
        options
      },
      askForMoreTimeFeatureEnabled: true,
      previousPage: paths.awaitingClarifyingQuestionsAnswers.question.replace(new RegExp(`:id`), `${req.params.id}`)
    });
  } catch (error) {
    next(error);
  }
}

function postSupportingEvidenceQuestionPage(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.saveAndAskMoreTime) {
        req.session.appeal.application.saveAndAskForTime = true;
        return res.redirect(paths.common.askForMoreTimeReason);
      }
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
      const validations = yesOrNoRequiredValidation(req.body, i18n.validationErrors.reasonForAppeal.supportingEvidenceRequired);
      if (validations !== null) {
        return res.render('upload-evidence/supporting-evidence-question-page.njk', {
          questionOrderNo: req.params.id,
          question: {
            name: 'answer',
            options
          },
          askForMoreTimeFeatureEnabled: true,
          previousPage: paths.awaitingClarifyingQuestionsAnswers.question.replace(new RegExp(`:id`), `${req.params.id}`),
          errorList: Object.values(validations),
          error: validations
        });
      }
      if (req.body.answer === 'true') {
        let redirectUri = paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), parseInt(req.params.id, 10).toString());
        return res.redirect(redirectUri);
      } else {
        const questionOrderNo = parseInt(req.params.id, 10) - 1;
        const supportingEvidences = req.session.appeal.draftClarifyingQuestionsAnswers[questionOrderNo].value.supportingEvidence;
        if (supportingEvidences) {
          supportingEvidences.forEach(async (evidence: Evidence) => {
            await documentManagementService.deleteFile(req, evidence.fileId);
          });

          const questions = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
          const updatedQuestions = questions.map((question, index) => {
            if (questionOrderNo !== index) return question;
            return {
              ...question,
              value: {
                ...question.value,
                supportingEvidence: []
              }
            };
          });

          const appeal: Appeal = {
            ...req.session.appeal,
            draftClarifyingQuestionsAnswers: updatedQuestions
          };
          const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
          req.session.appeal = {
            ...req.session.appeal,
            ...appealUpdated
          };
        }
        return res.redirect(paths.awaitingClarifyingQuestionsAnswers.questionsList);
      }
    } catch (e) {
      next(e);
    }
  };
}

function setupSupportingEvidenceQuestionController(middleware: Middleware[], deps): Router {
  const router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion, middleware, getSupportingEvidenceQuestionPage);
  router.post(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion, middleware, postSupportingEvidenceQuestionPage(deps.updateAppealService, deps.documentManagementService));
  return router;
}

export {
  getSupportingEvidenceQuestionPage,
  postSupportingEvidenceQuestionPage,
  setupSupportingEvidenceQuestionController
};
