import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { isPreAddendumEvidenceUploadState } from '../../utils/application-state-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
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

    const content = {
      title: i18n.pages.provideMoreEvidence.form.title,
      content: i18n.pages.provideMoreEvidence.form.content,
      moreInfo: i18n.pages.provideMoreEvidence.form.moreInfo,
      formSubmitAction: paths.common.provideMoreEvidenceForm,
      evidenceUploadAction: paths.common.provideMoreEvidenceUploadFile,
      evidences: req.session.appeal.additionalEvidence || [],
      evidenceCTA: paths.common.provideMoreEvidenceDeleteFile,
      previousPage: paths.common.overview,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) },
      continueCancelButtons: true,
      redirectTo: paths.common.provideMoreEvidenceCheck
    };
    if (isPreAddendumEvidenceUploadState(req.session.appeal.appealStatus)) {
      content.evidences = req.session.appeal.addendumEvidence;
      content.redirectTo = paths.common.whyEvidenceLate;
    }

    res.render('templates/multiple-evidence-upload-page.njk', content);
  } catch (e) {
    next(e);
  }
}

function getReasonForLateEvidence(req: Request, res: Response, next: NextFunction) {
  if ((req.session.appeal.addendumEvidence || []).length === 0) {
    return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
  }
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        whyEvidenceLate: createStructuredError('whyEvidenceLate', i18n.validationErrors.whyEvidenceLate)
      };
    }
    res.render('upload-evidence/reason-for-late-evidence-page.njk', {
      title: i18n.pages.provideMoreEvidence.whyEvidenceLate.title,
      content: i18n.pages.provideMoreEvidence.whyEvidenceLate.content,
      formSubmitAction: paths.common.whyEvidenceLate,
      id: 'whyEvidenceLate',
      previousPage: paths.common.provideMoreEvidenceForm,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postReasonForLateEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    let addendumEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.addendumEvidence || [])];

    if (addendumEvidence.length === 0) {
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    }

    const reasonForLateEvidence = req.body.whyEvidenceLate || null;

    if (reasonForLateEvidence) {
      addendumEvidence.forEach(e => e.description = reasonForLateEvidence);
      const appeal: Appeal = {
        ...req.session.appeal,
        addendumEvidence
      };
      req.session.appeal = appeal;

      return res.redirect(paths.common.provideMoreEvidenceCheck);
    } else {
      return res.redirect(`${paths.common.whyEvidenceLate}?error=reasonForLateEvidence`);
    }
  } catch (e) {
    next(e);
  }
}

function postProvideMoreEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    const additionalEvidenceDocuments = req.session.appeal.additionalEvidence || [];
    if (additionalEvidenceDocuments.length > 0) {
      const redirectTo = paths.common.whyEvidenceLate;
      return res.redirect(redirectTo);
    } else {
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    }
  } catch (e) {
    next(e);
  }
}

function validate (redirectToUrl: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      let errorCode: string;
      if (res.locals.errorCode) {
        errorCode = res.locals.errorCode;
      }
      if (errorCode) {
        return res.redirect(`${redirectToUrl}?error=${errorCode}`);
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

function uploadProvideMoreEvidence(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    }
    return (isPreAddendumEvidenceUploadState(req.session.appeal.appealStatus)
      ? uploadAddendumEvidence(req, res, documentManagementService)
      : uploadAdditionalEvidence(req, res, documentManagementService)).catch(e => next(e));
  };
}

function postProvideMoreEvidenceCheckAndSend(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (isPreAddendumEvidenceUploadState(req.session.appeal.appealStatus)) {
      return postAddendumEvidence(req, res, updateAppealService).catch(e => next(e));
    } else {
      return postAdditionalEvidence(req, res, updateAppealService).catch(e => next(e));
    }
  };
}

function deleteProvideMoreEvidence(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.id) {
      if (isPreAddendumEvidenceUploadState(req.session.appeal.appealStatus)) {
        return deleteAddendumEvidence(req, res, documentManagementService).catch(e => next(e));
      } else {
        return deleteAdditionalEvidence(req, res, documentManagementService).catch(e => next(e));
      }
    }
    return res.redirect(paths.common.provideMoreEvidenceForm);
  };
}

function getProvideMoreEvidenceCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const summaryList: SummaryList[] = isPreAddendumEvidenceUploadState(req.session.appeal.appealStatus) ? buildAddendumEvidenceDocumentsSummaryList(req.session.appeal.addendumEvidence) : buildAdditionalEvidenceDocumentsSummaryList(req.session.appeal.additionalEvidence);

    if (summaryList.length < 1) {
      return res.redirect(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    }

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
    if (isPreAddendumEvidenceUploadState(req.session.appeal.appealStatus)) {
      res.render('templates/confirmation-page.njk', {
        title: i18n.pages.provideMoreEvidence.confirmation.title,
        whatNextContent: i18n.pages.provideMoreEvidence.confirmation.whatNextContent
      });
    } else {
      res.render('templates/confirmation-page.njk', {
        title: i18n.pages.provideMoreEvidence.confirmation.title,
        whatNextListItems: i18n.pages.provideMoreEvidence.confirmation.whatNextListItems
      });
    }

  } catch (e) {
    next(e);
  }
}

function getEvidenceDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const additionalEvidenceDocuments = req.session.appeal.additionalEvidenceDocuments;
    const summaryList: SummaryList[] = buildUploadedAdditionalEvidenceDocumentsSummaryList(additionalEvidenceDocuments);

    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.provideMoreEvidence.yourEvidence.title,
      previousPage: paths.common.overview,
      summaryLists: summaryList
    });
  } catch (e) {
    next(e);
  }
}

function setupProvideMoreEvidenceController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router: Router = Router();
  router.get(paths.common.provideMoreEvidenceForm, middleware, getProvideMoreEvidence);
  router.post(paths.common.provideMoreEvidenceUploadFile, middleware, validate(paths.common.provideMoreEvidenceForm), uploadProvideMoreEvidence(updateAppealService, documentManagementService));
  router.get(paths.common.provideMoreEvidenceDeleteFile, middleware, deleteProvideMoreEvidence(updateAppealService, documentManagementService));
  router.get(paths.common.whyEvidenceLate, middleware, getReasonForLateEvidence);
  router.post(paths.common.whyEvidenceLate, middleware, validate(paths.common.whyEvidenceLate), postReasonForLateEvidence);
  router.get(paths.common.provideMoreEvidenceCheck, getProvideMoreEvidenceCheckAndSend);
  router.post(paths.common.provideMoreEvidenceCheck, middleware, validate(paths.common.provideMoreEvidenceForm), postProvideMoreEvidenceCheckAndSend(updateAppealService, documentManagementService));
  router.get(paths.common.provideMoreEvidenceConfirmation, getConfirmation);
  router.get(paths.common.yourEvidence, getEvidenceDocuments);
  return router;
}

function buildAdditionalEvidenceDocumentsSummaryList(additionalEvidenceDocuments: Evidence[]): SummaryList[] {
  const additionalEvidenceSummaryLists: SummaryList[] = [];
  const additionalEvidenceRows: SummaryRow[] = [];
  if (additionalEvidenceDocuments) {
    additionalEvidenceDocuments.forEach((evidence: Evidence) => {
      additionalEvidenceRows.push(
        addSummaryRow(
          i18n.pages.provideMoreEvidence.checkYourAnswers.evidenceTitle,
          [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
          'provide-more-evidence'
        )
      );
    });
    additionalEvidenceSummaryLists.push({
      summaryRows: additionalEvidenceRows
    });
  }

  return additionalEvidenceSummaryLists;
}

function buildAddendumEvidenceDocumentsSummaryList(addendumEvidenceDocuments: Evidence[]): SummaryList[] {
  const addendumEvidenceSummaryLists: SummaryList[] = [];
  const addendumEvidenceRows: SummaryRow[] = [];
  if (addendumEvidenceDocuments) {
    addendumEvidenceDocuments.forEach((evidence: Evidence) => {
      addendumEvidenceRows.push(
        addSummaryRow(
          i18n.pages.provideMoreEvidence.checkYourAnswers.evidenceTitle,
          [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
          'provide-more-evidence'
        ),
        addSummaryRow(
          i18n.pages.provideMoreEvidence.checkYourAnswers.evidenceDescription,
          [`<p>${evidence.description}</p>`],
          'why-evidence-late'
        )
      );
    });
    addendumEvidenceSummaryLists.push({
      summaryRows: addendumEvidenceRows
    });
  }

  return addendumEvidenceSummaryLists;
}

function buildUploadedAdditionalEvidenceDocumentsSummaryList(additionalEvidenceDocuments: Evidence[]): SummaryList[] {
  const additionalEvidenceSummaryLists: SummaryList[] = [];
  const additionalEvidenceRows: SummaryRow[] = [];

  if (additionalEvidenceDocuments) {

    additionalEvidenceDocuments.forEach((evidence: Evidence) => {
      additionalEvidenceRows.push(
        addSummaryRow(
          'Date uploaded',
          [`<p>${evidence.dateUploaded}</p>`]
        )
      );
      additionalEvidenceRows.push(
        addSummaryRow(
          'Document',
          [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`], null, Delimiter.BREAK_LINE
        )
      );
    });

    additionalEvidenceSummaryLists.push({
      summaryRows: additionalEvidenceRows
    });
  }

  return additionalEvidenceSummaryLists;
}

async function uploadAddendumEvidence(req: Request, res: Response, documentManagementService: DocumentManagementService): Promise<any> {
  const uploadAddendumEvidenceFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false);
  if (!uploadAddendumEvidenceFeatureEnabled) {
    return res.redirect(paths.common.overview);
  }

  const addendumEvidenceDocument: DocumentUploadResponse = await documentManagementService.uploadFile(req);
  const addendumEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.addendumEvidence || [])];

  addendumEvidence.push({
    name: addendumEvidenceDocument.name,
    fileId: addendumEvidenceDocument.fileId
  });

  req.session.appeal = {
    ...req.session.appeal,
    addendumEvidence
  };
  return res.redirect(paths.common.provideMoreEvidenceForm);
}

async function uploadAdditionalEvidence(req: Request, res: Response, documentManagementService: DocumentManagementService): Promise<any> {
  const additionalEvidenceDocument: DocumentUploadResponse = await documentManagementService.uploadFile(req);
  const additionalEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.additionalEvidence || [])];

  additionalEvidence.push({
    name: additionalEvidenceDocument.name,
    fileId: additionalEvidenceDocument.fileId
  });

  req.session.appeal = {
    ...req.session.appeal,
    additionalEvidence
  };
  return res.redirect(paths.common.provideMoreEvidenceForm);
}

async function postAddendumEvidence(req: Request, res: Response, updateAppealService: UpdateAppealService): Promise<any> {
  const uploadAddendumEvidenceFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false);
  if (!uploadAddendumEvidenceFeatureEnabled) {
    return res.redirect(paths.common.overview);
  }

  const addendumEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.addendumEvidence || [])];
  const appeal: Appeal = {
    ...req.session.appeal,
    addendumEvidence: [...addendumEvidence]
  };
  const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.UPLOAD_ADDENDUM_EVIDENCE, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);

  req.session.appeal = {
    ...req.session.appeal,
    ...appealUpdated
  };
  req.session.appeal.addendumEvidence = [];

  return res.redirect(paths.common.provideMoreEvidenceConfirmation);
}

async function postAdditionalEvidence(req: Request, res: Response, updateAppealService: UpdateAppealService): Promise<any> {
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
  req.session.appeal.additionalEvidence = [];

  return res.redirect(paths.common.provideMoreEvidenceConfirmation);
}

async function deleteAddendumEvidence(req: Request, res: Response, documentManagementService: DocumentManagementService): Promise<any> {
  const addendumEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.addendumEvidence.filter(document => document.fileId !== req.query.id) || [])];
  const documentMap: DocumentMap[] = [...(req.session.appeal.documentMap.filter(document => document.id !== req.query.id) || [])];

  await documentManagementService.deleteFile(req, req.query.id as string);

  req.session.appeal.addendumEvidence = addendumEvidence;
  req.session.appeal.documentMap = documentMap;

  return res.redirect(paths.common.provideMoreEvidenceForm);
}

async function deleteAdditionalEvidence(req: Request, res: Response, documentManagementService: DocumentManagementService): Promise<any> {
  const additionalEvidence: AdditionalEvidenceDocument[] = [...(req.session.appeal.additionalEvidence.filter(document => document.fileId !== req.query.id) || [])];
  const documentMap: DocumentMap[] = [...(req.session.appeal.documentMap.filter(document => document.id !== req.query.id) || [])];

  await documentManagementService.deleteFile(req, req.query.id as string);

  req.session.appeal.additionalEvidence = additionalEvidence;
  req.session.appeal.documentMap = documentMap;

  return res.redirect(paths.common.provideMoreEvidenceForm);
}

export {
  getProvideMoreEvidence,
  postProvideMoreEvidence,
  getReasonForLateEvidence,
  postReasonForLateEvidence,
  uploadProvideMoreEvidence,
  deleteProvideMoreEvidence,
  getProvideMoreEvidenceCheckAndSend,
  setupProvideMoreEvidenceController,
  postProvideMoreEvidenceCheckAndSend,
  getConfirmation,
  getEvidenceDocuments,
  buildAdditionalEvidenceDocumentsSummaryList,
  buildAddendumEvidenceDocumentsSummaryList,
  buildUploadedAdditionalEvidenceDocumentsSummaryList,
  validate
};
