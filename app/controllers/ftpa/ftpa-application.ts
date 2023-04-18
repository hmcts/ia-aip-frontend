import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getDueDateForAppellantToRespondToJudgeDecision } from '../../utils/event-deadline-date-finder';
import { addSummaryRow } from '../../utils/summary-list';
import { isFtpaFeatureEnabled } from '../../utils/utils';
import { createStructuredError } from '../../utils/validations/fields-validations';

async function makeFtpaApplication(req: Request, res: Response, next: NextFunction) {
  const ftpaFlag = await isFtpaFeatureEnabled(req);
  if (!ftpaFlag) return res.redirect(paths.common.overview);

  try {
    let redirectPath = paths.ftpa.ftpaReason;

    if (isFtpaApplicationOutOfTime(req)) {
      req.session.appeal.ftpaAppellantSubmissionOutOfTime = 'Yes';
      redirectPath = paths.ftpa.ftpaOutOfTimeReason;
    }

    return res.redirect(redirectPath);
  } catch (e) {
    next(e);
  }
}

async function getReason(req: Request, res: Response, next: NextFunction, config: any) {

  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        ...config.validationErrors
      };
    }
    return res.render('ftpa-application/reason-page.njk', {
      title: config.title,
      content: config.content,
      hint: config.hint,
      formSubmitAction: config.formSubmitAction,
      reason: config.reason,
      id: config.id,
      ...config.ftpaDeadline && { ftpaDeadline:  config.ftpaDeadline },
      previousPage: config.previousPage,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

async function getFtpaOutOfTimeReason(req: Request, res: Response, next: NextFunction) {
  const ftpaFlag = await isFtpaFeatureEnabled(req);
  if (!ftpaFlag) return res.redirect(paths.common.overview);

  const config = {
    title: i18n.pages.ftpaApplication.ftpaOutOfTimeReason.title,
    content: i18n.pages.ftpaApplication.ftpaOutOfTimeReason.content,
    hint: i18n.pages.ftpaApplication.ftpaOutOfTimeReason.hint,
    formSubmitAction: paths.ftpa.ftpaOutOfTimeReason,
    reason: req.session.appeal.ftpaAppellantOutOfTimeExplanation,
    id: 'ftpaOutOfTimeReason',
    ftpaDeadline: getDueDateForAppellantToRespondToJudgeDecision(req),
    previousPage: paths.common.overview,
    validationErrors: {
      ftpaOutOfTimeReason: createStructuredError('ftpaOutOfTimeReason', i18n.validationErrors.ftpaApplication.ftpaOutOfTimeReason)
    }
  };

  return getReason(req, res, next, config);
}

function postFtpaOutOfTimeReason(req: Request, res: Response, next: NextFunction) {
  try {
    const ftpaOutOfTimeReason = req.body['ftpaOutOfTimeReason'];
    if (!ftpaOutOfTimeReason) {
      return res.redirect(`${paths.ftpa.ftpaOutOfTimeReason}?error=ftpaOutOfTimeReason`);
    }

    req.session.appeal.ftpaAppellantOutOfTimeExplanation = ftpaOutOfTimeReason;
    return res.redirect(paths.ftpa.ftpaOutOfTimeEvidenceQuestion);
  } catch (e) {
    next(e);
  }
}

async function getFtpaReason(req: Request, res: Response, next: NextFunction) {
  const ftpaFlag = await isFtpaFeatureEnabled(req);
  if (!ftpaFlag) return res.redirect(paths.common.overview);

  const previousPage = req.session.appeal.ftpaAppellantSubmissionOutOfTime === 'Yes'
      ? (req.session.appeal.ftpaOutOfTimeProvideEvidence === 'Yes'
          ? paths.ftpa.ftpaOutOfTimeEvidence
          : paths.ftpa.ftpaOutOfTimeEvidenceQuestion)
      : paths.common.overview;
  const config = {
    title: i18n.pages.ftpaApplication.ftpaReason.title,
    content: i18n.pages.ftpaApplication.ftpaReason.content,
    hint: i18n.pages.ftpaApplication.ftpaReason.hint,
    formSubmitAction: paths.ftpa.ftpaReason,
    reason: req.session.appeal.ftpaAppellantGrounds,
    id: 'ftpaReason',
    previousPage,
    validationErrors: {
      ftpaReason: createStructuredError('ftpaReason', i18n.validationErrors.ftpaApplication.ftpaReason)
    }
  };

  return getReason(req, res, next, config);
}

function postFtpaReason(req: Request, res: Response, next: NextFunction) {
  try {
    const ftpaReason = req.body['ftpaReason'];
    if (!ftpaReason) {
      return res.redirect(`${paths.ftpa.ftpaReason}?error=ftpaReason`);
    }

    req.session.appeal.ftpaAppellantGrounds = ftpaReason;
    return res.redirect(paths.ftpa.ftpaGrounds);
  } catch (e) {
    next(e);
  }
}

function getProvideEvidenceQuestion(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        ftpaEvidenceQuestion: createStructuredError('ftpaEvidenceQuestion', i18n.validationErrors.ftpaApplication.ftpaEvidenceQuestion)
      };
    }

    const ftpaProvideEvidence = req.session.appeal[config.provideEvidence];
    const question = {
      title: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
      name: 'answer',
      titleIsheading: true,
      options: [
        {
          value: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.value,
          text: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.text,
          checked: ftpaProvideEvidence === i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.value
        },
        {
          value: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.no.value,
          text: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.no.text,
          checked: ftpaProvideEvidence === i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.no.value
        }
      ],
      inline: true
    };

    return res.render('ftpa-application/evidence-question-page.njk', {
      previousPage: config.previousPage,
      pageTitle: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
      formAction: config.formAction,
      question,
      ...validationErrors && { errorList: Object.values(validationErrors) },
      ...validationErrors && { error: validationErrors },
      saveAndContinue: false
    });
  } catch (error) {
    next(error);
  }
}

function getProvideFtpaOutOfTimeEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
  const config = {
    provideEvidence: 'ftpaOutOfTimeProvideEvidence',
    previousPage: paths.ftpa.ftpaOutOfTimeReason,
    formAction: paths.ftpa.ftpaOutOfTimeEvidenceQuestion
  };

  return getProvideEvidenceQuestion(req, res, next, config);
}

function postProvideOutOfTimeEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const ftpaOutOfTimeProvideEvidence = req.body['answer'];

    if (ftpaOutOfTimeProvideEvidence) {
      const redirectTo = ftpaOutOfTimeProvideEvidence === i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.value
          ? paths.ftpa.ftpaOutOfTimeEvidence
          : paths.ftpa.ftpaReason;

      req.session.appeal.ftpaOutOfTimeProvideEvidence = ftpaOutOfTimeProvideEvidence;
      res.redirect(redirectTo);
    } else {
      res.redirect(`${paths.ftpa.ftpaOutOfTimeEvidenceQuestion}?error=ftpaEvidenceQuestion`);
    }
  } catch (error) {
    next(error);
  }
}

function getProvideFtpaEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
  const config = {
    provideEvidence: 'ftpaProvideEvidence',
    previousPage: paths.ftpa.ftpaGrounds,
    formAction: paths.ftpa.ftpaEvidenceQuestion
  };

  return getProvideEvidenceQuestion(req, res, next, config);
}

function postProvideEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const ftpaProvideEvidence = req.body['answer'];

    if (ftpaProvideEvidence) {
      const redirectTo = ftpaProvideEvidence === i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.value
          ? paths.ftpa.ftpaEvidence
          : paths.ftpa.ftpaCheckAndSend;

      req.session.appeal.ftpaProvideEvidence = ftpaProvideEvidence;
      res.redirect(redirectTo);
    } else {
      res.redirect(`${paths.ftpa.ftpaEvidenceQuestion}?error=ftpaEvidenceQuestion`);
    }
  } catch (error) {
    next(error);
  }
}

function getProvideDocument(req: Request, res: Response, next: NextFunction, config: any) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };

    }

    const content = {
      title: config.title,
      ...config.adviceHeader && { adviceHeader: config.adviceHeader },
      ...config.advice && { advice: config.advice },
      ...config.adviceList && { adviceList: config.adviceList },
      evidenceUploadAction: config.evidenceUploadAction,
      evidences: config.evidences || [],
      evidenceCTA: config.evidenceCTA,
      previousPage: config.previousPage,
      ...validationErrors && { errorList: Object.values(validationErrors) },
      ...validationErrors && { error: validationErrors },
      formSubmitAction: config.formSubmitAction
    };

    return res.render('ftpa-application/document-upload-page.njk', content);
  } catch (e) {
    next(e);
  }
}

function postFtpaOutOfTimeEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    if ((req.session.appeal.ftpaAppellantOutOfTimeDocuments || []).length > 0) {
      res.redirect(paths.ftpa.ftpaReason);
    } else {
      res.redirect(`${paths.ftpa.ftpaOutOfTimeEvidence}?error=noFileSelected`);
    }
  } catch (error) {
    next(error);
  }
}

function postFtpaEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    if ((req.session.appeal.ftpaAppellantEvidenceDocuments || []).length > 0) {
      res.redirect(paths.ftpa.ftpaCheckAndSend);
    } else {
      res.redirect(`${paths.ftpa.ftpaEvidence}?error=noFileSelected`);
    }
  } catch (error) {
    next(error);
  }
}

function postFtpaGrounds(req: Request, res: Response, next: NextFunction) {
  try {
    if ((req.session.appeal.ftpaAppellantGroundsDocuments || []).length > 0) {
      res.redirect(paths.ftpa.ftpaEvidenceQuestion);
    } else {
      res.redirect(`${paths.ftpa.ftpaGrounds}?error=noFileSelected`);
    }
  } catch (error) {
    next(error);
  }
}

function getProvideOutOfTimeEvidenceDocument(req: Request, res: Response, next: NextFunction) {
  const config = {
    title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
    adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
    adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
    evidenceUploadAction: paths.ftpa.ftpaOutOfTimeEvidenceUploadFile,
    evidences: req.session.appeal.ftpaAppellantOutOfTimeDocuments || [],
    evidenceCTA: paths.ftpa.ftpaOutOfTimeEvidenceDeleteFile,
    previousPage: paths.ftpa.ftpaOutOfTimeEvidenceQuestion,
    formSubmitAction: paths.ftpa.ftpaOutOfTimeEvidence
  };

  return getProvideDocument(req, res, next, config);
}

function getProvideGroundsDocument(req: Request, res: Response, next: NextFunction) {
  const config = {
    title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaGrounds.title,
    advice: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaGrounds.advice,
    evidenceUploadAction: paths.ftpa.ftpaGroundsUploadFile,
    evidences: req.session.appeal.ftpaAppellantGroundsDocuments || [],
    evidenceCTA: paths.ftpa.ftpaGroundsDeleteFile,
    previousPage: paths.ftpa.ftpaReason,
    formSubmitAction: paths.ftpa.ftpaGrounds
  };

  return getProvideDocument(req, res, next, config);
}

function getProvideEvidenceDocument(req: Request, res: Response, next: NextFunction) {
  const config = {
    title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
    adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
    adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
    evidenceUploadAction: paths.ftpa.ftpaEvidenceUploadFile,
    evidences: req.session.appeal.ftpaAppellantEvidenceDocuments || [],
    evidenceCTA: paths.ftpa.ftpaEvidenceDeleteFile,
    previousPage: paths.ftpa.ftpaEvidenceQuestion,
    formSubmitAction: paths.ftpa.ftpaEvidence
  };

  return getProvideDocument(req, res, next, config);
}

function uploadEvidence(documentManagementService: DocumentManagementService, pathId: string, evidenceName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const redirectTo = paths.ftpa[pathId];
    try {
      if (!req.file) {
        return res.redirect(`${redirectTo}?error=noFileSelected`);
      }

      const evidenceDocument: DocumentUploadResponse = await documentManagementService.uploadFile(req);
      const evidenceDocuments: Evidence[] = [...(req.session.appeal[evidenceName] || [])];
      evidenceDocuments.push({
        name: evidenceDocument.name,
        fileId: evidenceDocument.fileId
      });

      req.session.appeal[evidenceName] = evidenceDocuments;

      return res.redirect(redirectTo);
    } catch (e) {
      next(e);
    }
  };
}

function deleteEvidence(documentManagementService: DocumentManagementService, pathId: string, evidenceName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        const evidenceDocuments: Evidence[] = [...(req.session.appeal[evidenceName] || []).filter(document => document.fileId !== req.query.id)];
        const documentMap: DocumentMap[] = [...(req.session.appeal.documentMap || []).filter(document => document.id !== req.query.id)];

        await documentManagementService.deleteFile(req, req.query.id as string);

        req.session.appeal[evidenceName] = evidenceDocuments;
        req.session.appeal.documentMap = documentMap;
      }
      return res.redirect(paths.ftpa[pathId]);
    } catch (e) {
      next(e);
    }
  };
}

function getFtpaCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const summaryLists: SummaryList[] = buildSummaryList(req);
    const previousPage = req.session.appeal.ftpaProvideEvidence === i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.value
        ? paths.ftpa.ftpaEvidence
        : paths.ftpa.ftpaEvidenceQuestion;

    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.ftpaApplication.checkYourAnswers.title,
      continuePath: paths.ftpa.ftpaCheckAndSend,
      previousPage,
      summaryLists
    });
  } catch (e) {
    next(e);
  }
}

function postFtpaCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appeal: Appeal = {
        ...req.session.appeal
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.APPLY_FOR_FTPA_APPELLANT, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);

      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      delete (req.session.appeal.ftpaProvideEvidence);
      delete (req.session.appeal.ftpaOutOfTimeProvideEvidence);

      return res.redirect(paths.ftpa.ftpaConfirmation);
    } catch (e) {
      next(e);
    }
  };
}

function getConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/confirmation-page.njk', {
      title: i18n.pages.ftpaApplication.ftpaConfirmation.title,
      whatNextListItems: i18n.pages.ftpaApplication.ftpaConfirmation.whatNextListItems
    });
  } catch (e) {
    next(e);
  }
}

function buildSummaryList(req: Request): SummaryList[] {
  const summaryLists: SummaryList[] = [];
  const summaryRows: SummaryRow[] = [];
  const ftpaEvidence = req.session.appeal.ftpaAppellantEvidenceDocuments;
  const ftpaGrounds = req.session.appeal.ftpaAppellantGroundsDocuments;
  const ftpaOutOfTimeEvidence = req.session.appeal.ftpaAppellantOutOfTimeDocuments;

  if (req.session.appeal.ftpaAppellantOutOfTimeExplanation) {
    summaryRows.push(
        addSummaryRow(
            i18n.pages.ftpaApplication.checkYourAnswers.ftpaOutOfTimeExplanation,
            [`<p>${req.session.appeal.ftpaAppellantOutOfTimeExplanation}</p>`],
            paths.ftpa.ftpaOutOfTimeReason.slice(1)
        )
    );
  }
  if (ftpaOutOfTimeEvidence && ftpaOutOfTimeEvidence.length > 0) {
    ftpaOutOfTimeEvidence.forEach((evidence: Evidence, index: Number) => {
      let label = index === 0
          ? i18n.pages.ftpaApplication.checkYourAnswers.ftpaOutOfTimeEvidence
          : '';
      summaryRows.push(
          addSummaryRow(
              label,
              [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
              paths.ftpa.ftpaOutOfTimeEvidence.slice(1)
          )
      );
    });
  }
  if (req.session.appeal.ftpaAppellantGrounds) {
    summaryRows.push(
        addSummaryRow(
            i18n.pages.ftpaApplication.checkYourAnswers.ftpaReason,
            [`<p>${req.session.appeal.ftpaAppellantGrounds}</p>`],
            paths.ftpa.ftpaReason.slice(1)
        )
    );
  }
  if (ftpaGrounds && ftpaGrounds.length > 0) {
    ftpaGrounds.forEach((evidence: Evidence) => {
      summaryRows.push(
          addSummaryRow(
              '',
              [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
              paths.ftpa.ftpaGrounds.slice(1)
          )
      );
    });
  }
  if (ftpaEvidence && ftpaEvidence.length > 0) {
    ftpaEvidence.forEach((evidence: Evidence, index: Number) => {
      let label = index === 0
          ? i18n.pages.ftpaApplication.checkYourAnswers.ftpaEvidence
          : '';
      summaryRows.push(
          addSummaryRow(
              label,
              [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
              paths.ftpa.ftpaEvidence.slice(1)
          )
      );
    });
  }
  summaryLists.push({
    summaryRows
  });

  return summaryLists;
}

function isFtpaApplicationOutOfTime(req: Request): boolean {
  const dueDate: string = getDueDateForAppellantToRespondToJudgeDecision(req);

  return dueDate ? moment(dueDate).isBefore(moment(new Date().toString())) : false;
}

function validate(redirectUrl: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      if (res.locals.errorCode) {
        return res.redirect(`${redirectUrl}?error=${res.locals.errorCode}`);
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

function setupFtpaApplicationController(
    middleware: Middleware[],
    updateAppealService: UpdateAppealService,
    documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.ftpa.ftpaOutOfTimeReason, middleware, getFtpaOutOfTimeReason);
  router.get(paths.ftpa.ftpaReason, middleware, getFtpaReason);
  router.get(paths.ftpa.ftpaEvidenceQuestion, middleware, getProvideFtpaEvidenceQuestion);
  router.get(paths.ftpa.ftpaOutOfTimeEvidenceQuestion, middleware, getProvideFtpaOutOfTimeEvidenceQuestion);
  router.get(paths.ftpa.ftpaGrounds, middleware, getProvideGroundsDocument);
  router.get(paths.ftpa.ftpaEvidence, middleware, getProvideEvidenceDocument);
  router.get(paths.ftpa.ftpaOutOfTimeEvidence, middleware, getProvideOutOfTimeEvidenceDocument);
  router.get(paths.ftpa.ftpaCheckAndSend, middleware, getFtpaCheckAndSend);
  router.get(paths.ftpa.ftpaConfirmation, middleware, getConfirmation);
  router.get(paths.ftpa.ftpaApplication, middleware, makeFtpaApplication);
  router.post(paths.ftpa.ftpaOutOfTimeReason, middleware, postFtpaOutOfTimeReason);
  router.post(paths.ftpa.ftpaReason, middleware, postFtpaReason);
  router.post(paths.ftpa.ftpaGrounds, middleware, postFtpaGrounds);
  router.post(paths.ftpa.ftpaEvidenceQuestion, middleware, postProvideEvidenceQuestion);
  router.post(paths.ftpa.ftpaOutOfTimeEvidenceQuestion, middleware, postProvideOutOfTimeEvidenceQuestion);
  router.post(paths.ftpa.ftpaEvidence, middleware, postFtpaEvidence);
  router.post(paths.ftpa.ftpaOutOfTimeEvidence, middleware, postFtpaOutOfTimeEvidence);
  router.post(paths.ftpa.ftpaCheckAndSend, middleware, validate(paths.ftpa.ftpaEvidence), postFtpaCheckAndSend(updateAppealService));
  router.get(paths.ftpa.ftpaOutOfTimeEvidenceDeleteFile,
      middleware,
      deleteEvidence(documentManagementService, 'ftpaOutOfTimeEvidence', 'ftpaAppellantOutOfTimeDocuments'));
  router.post(
      paths.ftpa.ftpaOutOfTimeEvidenceUploadFile,
      middleware,
      validate(paths.ftpa.ftpaOutOfTimeEvidence),
      uploadEvidence(documentManagementService, 'ftpaOutOfTimeEvidence', 'ftpaAppellantOutOfTimeDocuments'));
  router.get(paths.ftpa.ftpaEvidenceDeleteFile,
      middleware,
      deleteEvidence(documentManagementService, 'ftpaEvidence', 'ftpaAppellantEvidenceDocuments'));
  router.post(
      paths.ftpa.ftpaEvidenceUploadFile,
      middleware,
      validate(paths.ftpa.ftpaEvidence),
      uploadEvidence(documentManagementService, 'ftpaEvidence', 'ftpaAppellantEvidenceDocuments'));
  router.get(paths.ftpa.ftpaGroundsDeleteFile,
      middleware,
      deleteEvidence(documentManagementService, 'ftpaGrounds', 'ftpaAppellantGroundsDocuments'));
  router.post(
      paths.ftpa.ftpaGroundsUploadFile,
      middleware,
      validate(paths.ftpa.ftpaGrounds),
      uploadEvidence(documentManagementService, 'ftpaGrounds', 'ftpaAppellantGroundsDocuments'));

  return router;
}

export {
  makeFtpaApplication,
  getReason,
  getFtpaOutOfTimeReason,
  postFtpaOutOfTimeReason,
  getFtpaReason,
  postFtpaReason,
  getProvideFtpaOutOfTimeEvidenceQuestion,
  postProvideOutOfTimeEvidenceQuestion,
  getProvideFtpaEvidenceQuestion,
  postProvideEvidenceQuestion,
  postFtpaCheckAndSend,
  getProvideDocument,
  uploadEvidence,
  deleteEvidence,
  postFtpaOutOfTimeEvidence,
  postFtpaGrounds,
  postFtpaEvidence,
  getConfirmation,
  getProvideOutOfTimeEvidenceDocument,
  getProvideGroundsDocument,
  getProvideEvidenceDocument,
  getFtpaCheckAndSend,
  buildSummaryList,
  isFtpaApplicationOutOfTime,
  isFtpaFeatureEnabled,
  setupFtpaApplicationController
};
