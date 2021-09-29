import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { Events } from '../../../app/data/events';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getNextPage } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { createStructuredError } from '../../utils/validations/fields-validations';

function getSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const questionOrder = parseInt(req.params.id, 10) - 1;
    const evidences = req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence || [];
    res.render('upload-evidence/supporting-evidence-upload-page.njk', {
      previousPage: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion.replace(new RegExp(':id'), req.params.id),
      evidences,
      evidenceUploadAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id),
      formSubmitAction: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceSubmit.replace(new RegExp(':id'), req.params.id),
      evidenceCTA: paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceDeleteFile.replace(new RegExp(':id'), req.params.id)
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
        const draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
        if (!draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence) {
          draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence = [ { ...evidenceStored } ];
        } else {
          draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence = [
            ...draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence,
            { ...evidenceStored }
          ];
        }
        const appeal: Appeal = {
          ...req.session.appeal,
          draftClarifyingQuestionsAnswers
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id)));
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
      const fileId: string = req.query.id as string;

      if (fileId) {
        const questionOrder = parseInt(req.params.id, 10) - 1;
        await documentManagementService.deleteFile(req, fileId);
        const supportingEvidences: Evidence[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence ];
        const draftClarifyingQuestionsAnswers = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
        draftClarifyingQuestionsAnswers[questionOrder].value.supportingEvidence = [
          ...supportingEvidences.filter((evidence: Evidence) => evidence.fileId !== req.query['id'])
        ];
        const appeal: Appeal = {
          ...req.session.appeal,
          draftClarifyingQuestionsAnswers
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        let redirectUri = paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), parseInt(req.params.id, 10).toString());
        res.redirect(redirectUri);
      }
    } catch (e) {
      next(e);
    }
  };
}

function postSupportingEvidenceSubmit(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.saveForLater) {
      return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
    }
    if (req.body.saveAndAskMoreTime) {
      req.session.appeal.application.saveAndAskForTime = true;
      return res.redirect(paths.common.askForMoreTimeReason);
    }
    const redirectPage = getRedirectPage(
      req.session.appeal.application.isEdit || false,
      paths.awaitingClarifyingQuestionsAnswers.checkAndSend,
      req.body.saveForLater,
      paths.awaitingClarifyingQuestionsAnswers.questionsList
    );
    return res.redirect(redirectPage);
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
