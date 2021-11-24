import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow } from '../../utils/summary-list';
import { createStructuredError } from '../../utils/validations/fields-validations';

function getProvideMoreEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };

    }
    const additionalEvidenceDocuments = req.session.appeal.additionalEvidence || [];

    res.render('templates/multiple-evidence-upload-page.njk', {
      title: i18n.pages.provideMoreEvidence.form.title,
      content: i18n.pages.provideMoreEvidence.form.content,
      moreInfo: i18n.pages.provideMoreEvidence.form.moreInfo,
      formSubmitAction: paths.common.provideMoreEvidenceForm,
      evidenceUploadAction: paths.common.provideMoreEvidenceUploadFile,
      evidences: additionalEvidenceDocuments,
      evidenceCTA: paths.common.provideMoreEvidenceDeleteFile,
      previousPage: paths.common.overview,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) },
      continueCancelButtons: true
    });
  } catch (e) {
    next(e);
  }
}

function postProvideMoreEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    const additionalEvidenceDocuments = req.session.appeal.additionalEvidence || [];
    if (additionalEvidenceDocuments.length > 0) {
      const redirectTo = paths.common.provideMoreEvidenceCheck;
      return res.redirect(redirectTo);
    } else {
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    }
  } catch (e) {
    next(e);
  }
}

function validate(req: Request, res: Response, next: NextFunction) {
  try {
    let errorCode: string;
    if (res.locals.errorCode) {
      errorCode = res.locals.errorCode;
    }
    if (errorCode) {
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=${errorCode}`);
    }
    next();
  } catch (e) {
    next(e);
  }
}

function uploadProvideMoreEvidence(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const additionalEvidenceDocument: DocumentUploadResponse = await documentManagementService.uploadFile(req);
        const additionalEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.additionalEvidence || [])];

        additionalEvidence.push({
          name: additionalEvidenceDocument.name,
          fileId: additionalEvidenceDocument.fileId,
          description: 'Additional evidence'
        });

        req.session.appeal = {
          ...req.session.appeal,
          additionalEvidence: [...additionalEvidence]
        };
        return res.redirect(paths.common.provideMoreEvidenceForm);
      }
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    } catch (e) {
      next(e);
    }
  };
}

function postProvideMoreEvidenceCheckAndSend(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const additionalEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.additionalEvidence || [])];
      const appeal: Appeal = {
        ...req.session.appeal,
        additionalEvidence: [...additionalEvidence]
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.UPLOAD_ADDITIONAL_EVIDENCE, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.common.provideMoreEvidenceConfirmation);
    } catch (e) {
      next(e);
    }
  };
}

function deleteProvideMoreEvidence(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        const additionalEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.additionalEvidence.filter(document => document.fileId !== req.query.id) || [])];
        const documentMap: DocumentMap[] = [...(req.session.appeal.documentMap.filter(document => document.id !== req.query.id) || [])];

        await documentManagementService.deleteFile(req, req.query.id as string);

        req.session.appeal.additionalEvidence = additionalEvidence;
        req.session.appeal.documentMap = documentMap;

        return res.redirect(paths.common.provideMoreEvidenceForm);
      }
    } catch (e) {
      next(e);
    }
  };
}

function getProvideMoreEvidenceCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const additionalEvidenceDocuments = req.session.appeal.additionalEvidence;
    const summaryList: SummaryList[] = buildAdditionalEvidenceDocumentsSummaryList(additionalEvidenceDocuments);

    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.provideMoreEvidence.checkYourAnswers.title,
      continuePath: paths.common.provideMoreEvidenceConfirmation,
      previousPage: paths.common.provideMoreEvidenceForm,
      summaryLists: summaryList
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.provideMoreEvidence.confirmation.title,
      whatNextListItems: i18n.pages.provideMoreEvidence.confirmation.whatNextListItems
    });
  } catch (e) {
    next(e);
  }
}

function setupProvideMoreEvidenceController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router: Router = Router();
  router.get(paths.common.provideMoreEvidenceForm, middleware, getProvideMoreEvidence);
  router.post(paths.common.provideMoreEvidenceUploadFile, middleware, validate, uploadProvideMoreEvidence(updateAppealService, documentManagementService));
  router.get(paths.common.provideMoreEvidenceDeleteFile, middleware, deleteProvideMoreEvidence(updateAppealService, documentManagementService));
  router.get(paths.common.provideMoreEvidenceCheck, getProvideMoreEvidenceCheckAndSend);
  router.post(paths.common.provideMoreEvidenceCheck, middleware, validate, postProvideMoreEvidenceCheckAndSend(updateAppealService, documentManagementService));
  router.get(paths.common.provideMoreEvidenceConfirmation, getConfirmation);
  return router;
}

function buildAdditionalEvidenceDocumentsSummaryList(additionalEvidenceDocuments: Evidence[]): SummaryList[] {
  const additionalEvidenceSummaryLists: SummaryList[] = [];
  const additionalEvidenceRows: SummaryRow[] = [];
  additionalEvidenceDocuments.map((evidence: Evidence) => {
    additionalEvidenceRows.push(
      addSummaryRow(
        'Supporting evidence',
        [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
        'provide-more-evidence'
      )
    );
  });

  additionalEvidenceSummaryLists.push({
    summaryRows: additionalEvidenceRows
  });

  return additionalEvidenceSummaryLists;
}

export {
  getProvideMoreEvidence,
  postProvideMoreEvidence,
  uploadProvideMoreEvidence,
  deleteProvideMoreEvidence,
  getProvideMoreEvidenceCheckAndSend,
  setupProvideMoreEvidenceController,
  postProvideMoreEvidenceCheckAndSend,
  getConfirmation,
  buildAdditionalEvidenceDocumentsSummaryList,
  validate
};
