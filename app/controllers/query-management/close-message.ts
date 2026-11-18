import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addDaysToDate } from '../../utils/date-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getFileUploadError } from '../../utils/upload-utils';
import { formatTextForCYA } from '../../utils/utils';
import { createStructuredError, followUpMessageValidation } from '../../utils/validations/fields-validations';
import {
  deleteEvidence,
  getMessagePath,
  postMessage,
  setMessageDetailsFromBody,
  uploadEvidence
} from './common-message-functions';

function getCloseMessagePage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    const errCode: string = req?.query['errorCode'] as string;
    const errors = { 'file-upload': createStructuredError('file-upload', getFileUploadError(errCode)) };
    return res.render('query-management/send-message.njk', {
      previousPage: getMessagePath(paths.common.viewMessage, parentId),
      title: i18n.pages.closeMessage.title,
      hasSubject: false,
      details: req.session.appeal?.messageDetails,
      evidenceUploadAction: getMessagePath(paths.common.closeMessageUpload, parentId),
      evidences: req.session.appeal?.messageDocs || [],
      evidenceCTA: getMessagePath(paths.common.closeMessageDelete, parentId),
      shouldAskAboutHearing: false,
      formAction: getMessagePath(paths.common.closeMessage, parentId),
      customHint: i18n.pages.closeMessage.help,
      customLabel: i18n.pages.closeMessage.desc,
      errors: errCode ? errors : undefined,
      errorList: errCode ? Object.values(errors) : undefined
    });
  } catch (e) {
    next(e);
  }
}

function postCloseMessagePage(req: Request, res: Response, next: NextFunction) {
  try {
    setMessageDetailsFromBody(req, false);
    const parentId = req.params['id'];
    const validation: ValidationErrors = followUpMessageValidation(req.body);
    if (validation) {
      return res.render('query-management/send-message.njk', {
        previousPage: getMessagePath(paths.common.viewMessage, parentId),
        title: i18n.pages.closeMessage.title,
        hasSubject: false,
        details: req.body?.[i18n.pages.sendMessage.messageId],
        evidenceUploadAction: getMessagePath(paths.common.closeMessageUpload, parentId),
        evidences: req.session.appeal?.messageDocs || [],
        evidenceCTA: getMessagePath(paths.common.closeMessageDelete, parentId),
        shouldAskAboutHearing: false,
        formAction: getMessagePath(paths.common.closeMessage, parentId),
        customHint: i18n.pages.closeMessage.help,
        customLabel: i18n.pages.closeMessage.desc,
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    return res.redirect(getMessagePath(paths.common.closeMessageCya, parentId));
  } catch (e) {
    next(e);
  }
}

function getCloseMessageCya(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    if (!req.session.appeal?.messageDetails) {
      return res.redirect(getMessagePath(paths.common.closeMessage, parentId));
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: getMessagePath(paths.common.closeMessageCya, parentId),
      previousPage: getMessagePath(paths.common.closeMessage, parentId),
      cancelPath: getMessagePath(paths.common.viewMessage, parentId),
      noContactUs: true,
      summaryRows
    });
  } catch (e) {
    next(e);
  }
}

function buildSummaryRows(req: Request): SummaryRow[] {
  const parentId = req.params['id'];
  const closeMessagePath = getMessagePath(paths.common.closeMessage, parentId);
  const summaryRows: SummaryRow[] = [
    addSummaryRow(
      i18n.pages.sendMessage.messageLabel,
      [formatTextForCYA(req.session.appeal.messageDetails)],
      closeMessagePath
    ),
  ];

  if (req.session.appeal?.messageDocs && req.session.appeal?.messageDocs.length > 0) {
    const evidenceText = req.session.appeal.messageDocs.map((evidence) => evidence.originalname);
    summaryRows.push(addSummaryRow(i18n.pages.sendMessage.uploadDocsCya, evidenceText, closeMessagePath, Delimiter.BREAK_LINE));
  }

  return summaryRows;
}

function postCloseMessageCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService, postMessageFn = postMessage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const specificQmFieldsToAdd: QmQuery = {
        messageType: 'Followup',
        parentId: parentId
      };

      await postMessageFn(req, specificQmFieldsToAdd, documentManagementService, updateAppealService, i18n.pages.closeMessage.messageDetailsPrefix);

      return res.redirect(getMessagePath(paths.common.closeMessageConfirmation, parentId));
    } catch (e) {
      next(e);
    }
  };
}

function getCloseMessageConfirmation(req: Request, res: Response, next: NextFunction) {
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

function setupCloseMessageController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.closeMessage, middleware, getCloseMessagePage);
  router.post(paths.common.closeMessageUpload, middleware, uploadEvidence(paths.common.closeMessage));
  router.get(paths.common.closeMessageDelete, middleware, deleteEvidence(paths.common.closeMessage));
  router.post(paths.common.closeMessage, middleware, postCloseMessagePage);
  router.get(paths.common.closeMessageCya, middleware, getCloseMessageCya);
  router.post(paths.common.closeMessageCya, middleware, postCloseMessageCya(updateAppealService, documentManagementService));
  router.get(paths.common.closeMessageConfirmation, middleware, getCloseMessageConfirmation);
  return router;
}

export {
  getCloseMessagePage,
  postCloseMessagePage,
  getCloseMessageCya,
  buildSummaryRows,
  postCloseMessageCya,
  getCloseMessageConfirmation,
  setupCloseMessageController
};
