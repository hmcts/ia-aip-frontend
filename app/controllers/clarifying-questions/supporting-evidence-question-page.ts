import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import { Events } from '../../../app/data/events';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { asBooleanValue, hasInflightTimeExtension } from '../../utils/utils';
import { yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

const askForMoreTimeFeatureEnabled: boolean = asBooleanValue(config.get('features.askForMoreTime'));

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
      previousPage: paths.awaitingClarifyingQuestionsAnswers.question.replace(new RegExp(`:id`), `${req.params.id}`),
      askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled,
      askForMoreTimeInFlight: hasInflightTimeExtension(req.session.appeal)
    });
  } catch (error) {
    next(error);
  }
}

function postSupportingEvidenceQuestionPage(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
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
        return res.redirect(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(`:id`), `${req.params.id}`));
      } else {
        const questionOrderNo = parseInt(req.params.id, 10) - 1;
        const supportingEvidences = req.session.appeal.draftClarifyingQuestionsAnswers[questionOrderNo].value.supportingEvidence;
        if (supportingEvidences) {
          supportingEvidences.forEach(async (evidence: Evidence) => {
            const targetUrl: string = documentIdToDocStoreUrl(evidence.fileId, req.session.appeal.documentMap);
            await documentManagementService.deleteFile(req, targetUrl);
          });
          req.session.appeal.draftClarifyingQuestionsAnswers[questionOrderNo].value.supportingEvidence = [];
          await updateAppealService.submitEvent(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, req);
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
