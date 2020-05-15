import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import { Events } from '../../../app/data/events';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { asBooleanValue, hasInflightTimeExtension } from '../../utils/utils';
import { createStructuredError } from '../../utils/validations/fields-validations';

const askForMoreTimeFeatureEnabled: boolean = asBooleanValue(config.get('features.askForMoreTime'));

function getSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    const questionOrder = parseInt(req.params.id, 10) - 1;
    const evidences = req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence || [];
    res.render('upload-evidence/supporting-evidence-upload-page.njk', {
      previousPage: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(new RegExp(':id'), req.params.id),
      evidences,
      evidenceUploadAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id),
      formSubmitAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceSubmit.replace(new RegExp(':id'), req.params.id),
      evidenceCTA: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceDeleteFile.replace(new RegExp(':id'), req.params.id),
      askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled,
      askForMoreTimeInFlight: hasInflightTimeExtension(req.session.appeal)
    });
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidenceUpload(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const questionOrder = parseInt(req.params.id, 10) - 1;
        const evidenceStored: Evidence = await documentManagementService.uploadFile(req);
        const cq: ClarifyingQuestion<Evidence> = { ...req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder] };
        if (!cq.value.supportingEvidence) {
          cq.value.supportingEvidence = [ { ...evidenceStored } ];
        } else {
          cq.value.supportingEvidence = [
            ...cq.value.supportingEvidence,
            { ...evidenceStored }
          ];
        }
        req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder] = { ...cq };
        await updateAppealService.submitEvent(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, req);
        res.redirect(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id));
      } else {
        const questionOrder = parseInt(req.params.id, 10) - 1;
        const evidences = req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence || [];
        const validationError = { uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload.noFileSelected) };
        res.render('upload-evidence/supporting-evidence-upload-page.njk', {
          previousPage: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(new RegExp(':id'), req.params.id),
          evidences,
          evidenceUploadAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id),
          formSubmitAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceSubmit.replace(new RegExp(':id'), req.params.id),
          error: validationError,
          errorList: Object.values(validationError)
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

function getSupportingEvidenceDelete(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        const questionOrder = parseInt(req.params.id, 10) - 1;
        const fileId = req.query.id;
        const targetUrl: string = documentIdToDocStoreUrl(fileId, req.session.appeal.documentMap);
        await documentManagementService.deleteFile(req, targetUrl);
        const supportingEvidences: Evidence[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence ];

        req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence = [
          ...supportingEvidences.filter((evidence: Evidence) => evidence.fileId !== req.query['id'])
        ];
        await updateAppealService.submitEvent(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, req);
        res.redirect(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id));
      }
    } catch (e) {
      next(e);
    }
  };
}

function postSupportingEvidenceSubmit(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect(paths.awaitingClarifyingQuestionsAnswers.questionsList);
  } catch (e) {
    next(e);
  }
}

function setupClarifyingQuestionsSupportingEvidenceUploadController(middleware: Middleware[], deps: any): Router {
  const router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile, getSupportingEvidenceUploadPage);
  router.post(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile, postSupportingEvidenceUpload(deps.documentManagementService, deps.updateAppealService));
  router.post(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceSubmit, postSupportingEvidenceSubmit);
  router.get(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceDeleteFile, getSupportingEvidenceDelete(deps.documentManagementService, deps.updateAppealService));
  return router;
}

export {
  getSupportingEvidenceDelete,
  getSupportingEvidenceUploadPage,
  postSupportingEvidenceUpload,
  postSupportingEvidenceSubmit,
  setupClarifyingQuestionsSupportingEvidenceUploadController
};
