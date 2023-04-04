import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getDueDateForAppellantToRespondToJudgeDecision } from '../../utils/event-deadline-date-finder';
import { addSummaryRow } from '../../utils/summary-list';
import { createStructuredError } from '../../utils/validations/fields-validations';

async function makeFtpaApplication(req: Request, res: Response, next: NextFunction) {
  const ftpaFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.FTPA, false);
  if (!ftpaFlag) return res.redirect(paths.common.overview);

  try {
    let redirectPath = paths.ftpa.ftpaReason;

    if (isFtpaApplicationOutOfTime(req)) {
      req.session.appeal.ftpaAppellantSubmissionOutOfTime = 'Yes';
      redirectPath = paths.ftpa.ftpaOutOfTimereason;
    }

    return res.redirect(redirectPath);
  } catch (e) {
    next(e);
  }
}

async function getFtpaReason(req: Request, res: Response, next: NextFunction) {
  const ftpaFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.FTPA, false);
  if (!ftpaFlag) return res.redirect(paths.common.overview);

  let previousPage = paths.common.overview;

  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        ftpaReason: createStructuredError('ftpaReason', i18n.validationErrors.ftpaApplication.ftpaReason)
      };
    }
    return res.render('ftpa-application/reason-for-application-page.njk', {
      title: i18n.pages.ftpaApplication.ftpaReason.title,
      content: i18n.pages.ftpaApplication.ftpaReason.content,
      hint: i18n.pages.ftpaApplication.ftpaReason.hint,
      formSubmitAction: paths.ftpa.ftpaReason,
      ftpaReason: req.session.appeal.ftpaReason,
      id: 'ftpaReason',
      previousPage,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postFtpaReason(req: Request, res: Response, next: NextFunction) {
  try {
    const ftpaReason = req.body['ftpaReason'];
    if (!ftpaReason) {
      return res.redirect(`${paths.ftpa.ftpaReason}?error=ftpaReason`);
    }

    req.session.appeal.ftpaReason = ftpaReason;
    return res.redirect(paths.ftpa.ftpaGrounds);
  } catch (e) {
    next(e);
  }
}

function getProvideEvidenceQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        ftpaEvidenceQuestion: createStructuredError('ftpaEvidenceQuestion', i18n.validationErrors.ftpaApplication.ftpaEvidenceQuestion)
      };
    }

    const ftpaProvideEvidence = req.session.appeal.ftpaProvideEvidence;
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
      previousPage: paths.ftpa.ftpaGrounds,
      pageTitle: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
      formAction: paths.ftpa.ftpaEvidenceQuestion,
      question,
      ...validationErrors && { errorList: Object.values(validationErrors) },
      ...validationErrors && { error: validationErrors },
      saveAndContinue: false
    });
  } catch (error) {
    next(error);
  }
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
      adviceHeader: config.adviceHeader,
      advice: config.advice,
      adviceList: config.adviceList,
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
      delete (req.session.appeal.ftpaProvideEvidence);
      const ftpaReason = req.session.appeal.ftpaReason;
      delete (req.session.appeal.ftpaReason);
      const appeal: Appeal = {
        ...req.session.appeal
      };
      appeal.ftpaAppellantGroundsDocuments = (appeal.ftpaAppellantGroundsDocuments || []).map(doc => {
        return {
          ...doc,
          'description': ftpaReason
        };
      });
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.APPLY_FOR_FTPA_APPELLANT, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);

      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      req.session.appeal.ftpaAppellantEvidenceDocuments = [];
      req.session.appeal.ftpaAppellantGroundsDocuments = [];

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

  if (req.session.appeal.ftpaReason) {
    summaryRows.push(
        addSummaryRow(
            i18n.pages.ftpaApplication.checkYourAnswers.ftpaReason,
            [`<p>${req.session.appeal.ftpaReason}</p>`],
            paths.ftpa.ftpaReason.slice(1)
        )
    );
  }
  if (ftpaGrounds && ftpaGrounds.length > 0) {
    ftpaGrounds.forEach((evidence: Evidence) => {
      summaryRows.push(
        addSummaryRow(
          i18n.pages.ftpaApplication.checkYourAnswers.ftpaGrounds,
          [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`],
          paths.ftpa.ftpaGrounds.slice(1)
        )
      );
    });
  }
  if (ftpaEvidence && ftpaEvidence.length > 0) {
    ftpaEvidence.forEach((evidence: Evidence) => {
      summaryRows.push(
        addSummaryRow(
          i18n.pages.ftpaApplication.checkYourAnswers.ftpaEvidence,
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
  router.get(paths.ftpa.ftpaReason, middleware, getFtpaReason);
  router.get(paths.ftpa.ftpaEvidenceQuestion, middleware, getProvideEvidenceQuestion);
  router.get(paths.ftpa.ftpaGrounds, middleware, getProvideGroundsDocument);
  router.get(paths.ftpa.ftpaEvidence, middleware, getProvideEvidenceDocument);
  router.get(paths.ftpa.ftpaCheckAndSend, middleware, getFtpaCheckAndSend);
  router.get(paths.ftpa.ftpaConfirmation, middleware, getConfirmation);
  router.get(paths.ftpa.ftpaApplication, middleware, makeFtpaApplication);
  router.post(paths.ftpa.ftpaReason, middleware, postFtpaReason);
  router.post(paths.ftpa.ftpaGrounds, middleware, postFtpaGrounds);
  router.post(paths.ftpa.ftpaEvidenceQuestion, middleware, postProvideEvidenceQuestion);
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
  router.post(paths.ftpa.ftpaEvidence, middleware, postFtpaEvidence);
  router.post(paths.ftpa.ftpaCheckAndSend, middleware, validate(paths.ftpa.ftpaEvidence), postFtpaCheckAndSend(updateAppealService));

  return router;
}

export {
  makeFtpaApplication,
  getFtpaReason,
  postFtpaReason,
  getProvideEvidenceQuestion,
  postProvideEvidenceQuestion,
  postFtpaCheckAndSend,
  getProvideDocument,
  uploadEvidence,
  deleteEvidence,
  postFtpaGrounds,
  postFtpaEvidence,
  getConfirmation,
  getProvideGroundsDocument,
  getProvideEvidenceDocument,
  getFtpaCheckAndSend,
  buildSummaryList,
  isFtpaApplicationOutOfTime,
  setupFtpaApplicationController
};
