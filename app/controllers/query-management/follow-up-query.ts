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
  followUpQueryValidation,
  statementValidation
} from '../../utils/validations/fields-validations';
import {
  deleteEvidence,
  getQueryPath,
  postQuery,
  setMessageDetailsFromBody,
  uploadEvidence
} from './common-query-functions';

function getFollowUpPermissionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    return res.render('query-management/send-message-permission.njk', {
      previousPage: getQueryPath(paths.common.viewQuery, parentId),
      formAction: getQueryPath(paths.common.followUpQueryPermission, parentId),
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
        previousPage: getQueryPath(paths.common.viewQuery, parentId),
        formAction: getQueryPath(paths.common.followUpQueryPermission, parentId),
        error: validation,
        errorList: Object.values(validation)
      });
    }

    return res.redirect(getQueryPath(paths.common.followUpQuery, parentId));
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
      previousPage: getQueryPath(paths.common.followUpQueryPermission, parentId),
      title: i18n.pages.followUpQueryTitle,
      hasSubject: false,
      details: req.session.appeal?.messageDetails,
      evidenceUploadAction: getQueryPath(paths.common.followUpQueryUpload, parentId),
      evidences: req.session.appeal?.messageDocs || [],
      evidenceCTA: getQueryPath(paths.common.followUpQueryDelete, parentId),
      shouldAskAboutHearing: false,
      formAction: getQueryPath(paths.common.followUpQuery, parentId),
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
    const validation: ValidationErrors = followUpQueryValidation(req.body);
    if (validation) {
      return res.render('query-management/send-message.njk', {
        previousPage: getQueryPath(paths.common.followUpQueryPermission, parentId),
        title: i18n.pages.followUpQueryTitle,
        hasSubject: false,
        details: req.body?.[i18n.pages.sendMessage.messageId],
        evidenceUploadAction: getQueryPath(paths.common.followUpQueryUpload, parentId),
        evidences: req.session.appeal?.messageDocs || [],
        evidenceCTA: getQueryPath(paths.common.followUpQueryDelete, parentId),
        shouldAskAboutHearing: false,
        formAction: getQueryPath(paths.common.followUpQuery, parentId),
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    return res.redirect(getQueryPath(paths.common.followUpQueryCya, parentId));
  } catch (e) {
    next(e);
  }
}

function getFollowUpCya(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    if (!req.session.appeal?.messageDetails) {
      return res.redirect(getQueryPath(paths.common.followUpQuery, parentId));
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: getQueryPath(paths.common.followUpQueryCya, parentId),
      previousPage: getQueryPath(paths.common.followUpQuery, parentId),
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
  const followUpQueryPath = getQueryPath(paths.common.followUpQuery, parentId);
  const summaryRows: SummaryRow[] = [
    addSummaryRow(
      i18n.pages.sendMessage.messageLabel,
      [formatTextForCYA(req.session.appeal.messageDetails)],
      followUpQueryPath
    ),
  ];

  if (req.session.appeal?.messageDocs && req.session.appeal?.messageDocs.length > 0) {
    const evidenceText = req.session.appeal.messageDocs.map((evidence) => evidence.originalname);
    summaryRows.push(addSummaryRow(i18n.pages.sendMessage.uploadDocsCya, evidenceText, followUpQueryPath, Delimiter.BREAK_LINE));
  }

  return summaryRows;
}

function postFollowUpCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService, postQueryFn = postQuery) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const specificQmFieldsToAdd: QmQuery = {
        messageType: 'Followup',
        parentId: parentId
      };

      await postQueryFn(req, specificQmFieldsToAdd, documentManagementService, updateAppealService);

      return res.redirect(getQueryPath(paths.common.followUpQueryConfirmation, parentId));
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

function setupFollowUpQueryController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.followUpQueryPermission, middleware, getFollowUpPermissionPage);
  router.post(paths.common.followUpQueryPermission, middleware, postFollowUpPermissionPage);
  router.get(paths.common.followUpQuery, middleware, getFollowUpPage);
  router.post(paths.common.followUpQueryUpload, middleware, uploadEvidence(paths.common.followUpQuery));
  router.get(paths.common.followUpQueryDelete, middleware, deleteEvidence(paths.common.followUpQuery));
  router.post(paths.common.followUpQuery, middleware, postFollowUpPage);
  router.get(paths.common.followUpQueryCya, middleware, getFollowUpCya);
  router.post(paths.common.followUpQueryCya, middleware, postFollowUpCya(updateAppealService, documentManagementService));
  router.get(paths.common.followUpQueryConfirmation, middleware, getFollowUpConfirmation);
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
  setupFollowUpQueryController
};
