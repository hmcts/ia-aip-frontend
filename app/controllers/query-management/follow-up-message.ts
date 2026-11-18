import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addDaysToDate } from '../../utils/date-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getFileUploadError } from '../../utils/upload-utils';
import { formatTextForCYA } from '../../utils/utils';
import {
  createStructuredError,
  followUpMessageValidation,
  statementValidation
} from '../../utils/validations/fields-validations';
import {
  deleteEvidence,
  getMessagePath,
  postMessage,
  setMessageDetailsFromBody,
  uploadEvidence
} from './common-message-functions';

function getFollowUpPermissionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    return res.render('query-management/send-message-permission.njk', {
      previousPage: getMessagePath(paths.common.viewMessage, parentId),
      formAction: getMessagePath(paths.common.followUpMessagePermission, parentId),
    });
  } catch (e) {
    next(e);
  }
}

function postFollowUpPermissionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    const validation = statementValidation(req.body, i18n.validationErrors.sendMessagePermissionStatement);
    if (validation) {
      return res.render('query-management/send-message-permission.njk', {
        previousPage: getMessagePath(paths.common.viewMessage, parentId),
        formAction: getMessagePath(paths.common.followUpMessagePermission, parentId),
        error: validation,
        errorList: Object.values(validation)
      });
    }

    return res.redirect(getMessagePath(paths.common.followUpMessage, parentId));
  } catch (error) {
    next(error);
  }
}

function getFollowUpPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    const errCode: string = req?.query['errorCode'] as string;
    const errors = { 'file-upload': createStructuredError('file-upload', getFileUploadError(errCode)) };
    return res.render('query-management/send-message.njk', {
      previousPage: getMessagePath(paths.common.followUpMessagePermission, parentId),
      title: i18n.pages.followUpMessageTitle,
      hasSubject: false,
      details: req.session.appeal?.messageDetails,
      evidenceUploadAction: getMessagePath(paths.common.followUpMessageUpload, parentId),
      evidences: req.session.appeal?.messageDocs || [],
      evidenceCTA: getMessagePath(paths.common.followUpMessageDelete, parentId),
      shouldAskAboutHearing: false,
      formAction: getMessagePath(paths.common.followUpMessage, parentId),
      errors: errCode ? errors : undefined,
      errorList: errCode ? Object.values(errors) : undefined
    });
  } catch (e) {
    next(e);
  }
}

function postFollowUpPage(req: Request, res: Response, next: NextFunction) {
  try {
    setMessageDetailsFromBody(req, false);
    const parentId = req.params['id'];
    const validation: ValidationErrors = followUpMessageValidation(req.body);
    if (validation) {
      return res.render('query-management/send-message.njk', {
        previousPage: getMessagePath(paths.common.followUpMessagePermission, parentId),
        title: i18n.pages.followUpMessageTitle,
        hasSubject: false,
        details: req.body?.[i18n.pages.sendMessage.messageId],
        evidenceUploadAction: getMessagePath(paths.common.followUpMessageUpload, parentId),
        evidences: req.session.appeal?.messageDocs || [],
        evidenceCTA: getMessagePath(paths.common.followUpMessageDelete, parentId),
        shouldAskAboutHearing: false,
        formAction: getMessagePath(paths.common.followUpMessage, parentId),
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    return res.redirect(getMessagePath(paths.common.followUpMessageCya, parentId));
  } catch (e) {
    next(e);
  }
}

function getFollowUpCya(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    if (!req.session.appeal?.messageDetails) {
      return res.redirect(getMessagePath(paths.common.followUpMessage, parentId));
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: getMessagePath(paths.common.followUpMessageCya, parentId),
      previousPage: getMessagePath(paths.common.followUpMessage, parentId),
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
  const followUpMessagePath = getMessagePath(paths.common.followUpMessage, parentId);
  const summaryRows: SummaryRow[] = [
    addSummaryRow(
      i18n.pages.sendMessage.messageLabel,
      [formatTextForCYA(req.session.appeal.messageDetails)],
      followUpMessagePath
    ),
  ];

  if (req.session.appeal?.messageDocs && req.session.appeal?.messageDocs.length > 0) {
    const evidenceText = req.session.appeal.messageDocs.map((evidence) => evidence.originalname);
    summaryRows.push(addSummaryRow(i18n.pages.sendMessage.uploadDocsCya, evidenceText, followUpMessagePath, Delimiter.BREAK_LINE));
  }

  return summaryRows;
}

function postFollowUpCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService, postMessageFn = postMessage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const specificQmFieldsToAdd: QmQuery = {
        messageType: 'Followup',
        parentId: parentId
      };

      await postMessageFn(req, specificQmFieldsToAdd, documentManagementService, updateAppealService);

      return res.redirect(getMessagePath(paths.common.followUpMessageConfirmation, parentId));
    } catch (e) {
      next(e);
    }
  };
}

function getFollowUpConfirmation(req: Request, res: Response, next: NextFunction) {
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

function setupFollowUpMessageController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.followUpMessagePermission, middleware, getFollowUpPermissionPage);
  router.post(paths.common.followUpMessagePermission, middleware, postFollowUpPermissionPage);
  router.get(paths.common.followUpMessage, middleware, getFollowUpPage);
  router.post(paths.common.followUpMessageUpload, middleware, uploadEvidence(paths.common.followUpMessage));
  router.get(paths.common.followUpMessageDelete, middleware, deleteEvidence(paths.common.followUpMessage));
  router.post(paths.common.followUpMessage, middleware, postFollowUpPage);
  router.get(paths.common.followUpMessageCya, middleware, getFollowUpCya);
  router.post(paths.common.followUpMessageCya, middleware, postFollowUpCya(updateAppealService, documentManagementService));
  router.get(paths.common.followUpMessageConfirmation, middleware, getFollowUpConfirmation);
  return router;
}

export {
  getFollowUpPermissionPage,
  postFollowUpPermissionPage,
  getFollowUpPage,
  postFollowUpPage,
  getFollowUpCya,
  buildSummaryRows,
  postFollowUpCya,
  getFollowUpConfirmation,
  setupFollowUpMessageController
};
