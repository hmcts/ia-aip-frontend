import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addDaysToDate } from '../../utils/date-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getFileUploadError } from '../../utils/upload-utils';
import { formatTextForCYA } from '../../utils/utils';
import { createStructuredError, followUpQueryValidation } from '../../utils/validations/fields-validations';
import {
  deleteEvidence,
  getQueryPath,
  postQuery,
  setMessageDetailsFromBody,
  uploadEvidence
} from './common-query-functions';

function getCloseQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    const errCode: string = req?.query['errorCode'] as string;
    const errors = { 'file-upload': createStructuredError('file-upload', getFileUploadError(errCode)) };
    return res.render('query-management/send-message.njk', {
      previousPage: getQueryPath(paths.common.viewQuery, parentId),
      title: i18n.pages.closeQuery.title,
      hasSubject: false,
      details: req.session.appeal?.messageDetails,
      evidenceUploadAction: getQueryPath(paths.common.closeQueryUpload, parentId),
      evidences: req.session.appeal?.messageDocs || [],
      evidenceCTA: getQueryPath(paths.common.closeQueryDelete, parentId),
      shouldAskAboutHearing: false,
      formAction: getQueryPath(paths.common.closeQuery, parentId),
      customHint: i18n.pages.closeQuery.help,
      customLabel: i18n.pages.closeQuery.desc,
      errors: errCode ? errors : undefined,
      errorList: errCode ? Object.values(errors) : undefined
    });
  } catch (e) {
    next(e);
  }
}

function postCloseQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    setMessageDetailsFromBody(req, false);
    const parentId = req.params['id'];
    const validation: ValidationErrors = followUpQueryValidation(req.body);
    if (validation) {
      return res.render('query-management/send-message.njk', {
        previousPage: getQueryPath(paths.common.viewQuery, parentId),
        title: i18n.pages.closeQuery.title,
        hasSubject: false,
        details: req.body?.[i18n.pages.sendMessage.messageId],
        evidenceUploadAction: getQueryPath(paths.common.closeQueryUpload, parentId),
        evidences: req.session.appeal?.messageDocs || [],
        evidenceCTA: getQueryPath(paths.common.closeQueryDelete, parentId),
        shouldAskAboutHearing: false,
        formAction: getQueryPath(paths.common.closeQuery, parentId),
        customHint: i18n.pages.closeQuery.help,
        customLabel: i18n.pages.closeQuery.desc,
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    return res.redirect(getQueryPath(paths.common.closeQueryCya, parentId));
  } catch (e) {
    next(e);
  }
}

function getCloseQueryCya(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    if (!req.session.appeal?.messageDetails) {
      return res.redirect(getQueryPath(paths.common.closeQuery, parentId));
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: getQueryPath(paths.common.closeQueryCya, parentId),
      previousPage: getQueryPath(paths.common.closeQuery, parentId),
      cancelPath: getQueryPath(paths.common.viewQuery, parentId),
      noContactUs: true,
      summaryRows
    });
  } catch (e) {
    next(e);
  }
}

function buildSummaryRows(req: Request): SummaryRow[] {
  const parentId = req.params['id'];
  const closeQueryPath = getQueryPath(paths.common.closeQuery, parentId);
  const summaryRows: SummaryRow[] = [
    addSummaryRow(
      i18n.pages.sendMessage.messageLabel,
      [formatTextForCYA(req.session.appeal.messageDetails)],
      closeQueryPath
    ),
  ];

  if (req.session.appeal?.messageDocs && req.session.appeal?.messageDocs.length > 0) {
    const evidenceText = req.session.appeal.messageDocs.map((evidence) => evidence.originalname);
    summaryRows.push(addSummaryRow(i18n.pages.sendMessage.uploadDocsCya, evidenceText, closeQueryPath, Delimiter.BREAK_LINE));
  }

  return summaryRows;
}

function postCloseQueryCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService, postQueryFn = postQuery) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const specificQmFieldsToAdd: QmQuery = {
        messageType: 'Followup',
        parentId: parentId
      };

      await postQueryFn(req, specificQmFieldsToAdd, documentManagementService, updateAppealService, i18n.pages.closeQuery.messageDetailsPrefix);

      return res.redirect(getQueryPath(paths.common.closeQueryConfirmation, parentId));
    } catch (e) {
      next(e);
    }
  };
}

function getCloseQueryConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/confirmation-page.njk', {
      title: i18n.pages.sendMessageConfirmation.title,
      whatNextListItems: i18n.pages.sendMessageConfirmation.whatNextListItems,
      date: addDaysToDate(10)
    });
  } catch (e) {
    next(e);
  }
}

function setupCloseQueryController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.closeQuery, middleware, getCloseQueryPage);
  router.post(paths.common.closeQueryUpload, middleware, uploadEvidence(paths.common.closeQuery));
  router.get(paths.common.closeQueryDelete, middleware, deleteEvidence(paths.common.closeQuery));
  router.post(paths.common.closeQuery, middleware, postCloseQueryPage);
  router.get(paths.common.closeQueryCya, middleware, getCloseQueryCya);
  router.post(paths.common.closeQueryCya, middleware, postCloseQueryCya(updateAppealService, documentManagementService));
  router.get(paths.common.closeQueryConfirmation, middleware, getCloseQueryConfirmation);
  return router;
}

export {
  getCloseQueryPage,
  postCloseQueryPage,
  getCloseQueryCya,
  buildSummaryRows,
  postCloseQueryCya,
  getCloseQueryConfirmation,
  setupCloseQueryController
};
