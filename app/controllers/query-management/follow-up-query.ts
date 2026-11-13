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
      previousPage: getQueryPath(paths.common.viewQuery, parentId)
    });
  } catch (e) {
    next(e);
  }
}

function postFollowUpPermissionPage() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const validation = statementValidation(req.body, i18n.validationErrors.sendMessagePermissionStatement);
      if (validation) {
        return res.render('query-management/send-message-permission.njk', {
          previousPage: getQueryPath(paths.common.viewQuery, parentId),
          error: validation,
          errorList: Object.values(validation)
        });
      }

      return res.redirect(getQueryPath(paths.common.followUpQuery, parentId));
    } catch (error) {
      next(error);
    }
  };
}

function getFollowUpPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    const errCode: string = req?.query['errorCode'] as string;
    const errors = { 'file-upload': createStructuredError('file-upload', getFileUploadError(errCode)) };
    return res.render('query-management/send-message.njk', {
      previousPage: getQueryPath(paths.common.followUpQueryPermission, parentId),
      title: i18n.pages.followUpQueryTitle,
      subject: req.session.appeal?.messageSubject,
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

function postFollowUpPage() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const isFollowUpMessage: boolean = Object.keys(req.params).includes('id');
      setMessageDetailsFromBody(req, !isFollowUpMessage);
      const parentId = req.params['id'];
      const validation: ValidationErrors = followUpQueryValidation(req.body);
      if (validation) {
        return res.render('query-management/send-message.njk', {
          previousPage: getQueryPath(paths.common.followUpQueryPermission, parentId),
          title: i18n.pages.followUpQueryTitle,
          subject: req.body?.[i18n.pages.sendMessage.subjectId],
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
  };
}

function uploadFollowUpEvidence() {
  return (req: Request, res: Response, next: NextFunction) => {
    return uploadEvidence(req, res, next);
  };
}

function deleteFollowUpEvidence() {
  return (req: Request, res: Response, next: NextFunction) => {
    return deleteEvidence(req, res, next);
  };
}

function getFollowUpCya(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    if (!req.session.appeal?.messageDetails || !req.session.appeal?.messageSubject) {
      return res.redirect(getQueryPath(paths.common.followUpQuery, parentId));
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: getQueryPath(paths.common.followUpQueryCya, parentId),
      previousPage: getQueryPath(paths.common.followUpQuery, parentId),
      cancelPath: getQueryPath(paths.common.viewQuery, parentId),
      summaryRows
    });
  } catch (e) {
    next(e);
  }
}

function buildSummaryRows(req: Request): SummaryRow[] {
  const summaryRows: SummaryRow[] = [
    addSummaryRow(
      i18n.pages.sendMessage.subjectLabel,
      [formatTextForCYA(req.session.appeal.messageSubject)],
      paths.common.followUpQuery
    ),
    addSummaryRow(
      i18n.pages.sendMessage.messageLabel,
      [formatTextForCYA(req.session.appeal.messageDetails)],
      paths.common.followUpQuery
    ),
  ];

  if (req.session.appeal?.messageDocs && req.session.appeal?.messageDocs.length > 0) {
    const evidenceText = req.session.appeal.messageDocs.map((evidence) => evidence.originalname);
    summaryRows.push(addSummaryRow(i18n.pages.sendMessage.uploadDocsCya, evidenceText, paths.common.followUpQuery, Delimiter.BREAK_LINE));
  }

  return summaryRows;
}

function postFollowUpCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const specificQmFieldsToAdd: QmQuery = {
        messageType: 'Followup',
        parentId: parentId
      };

      await postQuery(req, specificQmFieldsToAdd, documentManagementService, updateAppealService);

      return res.redirect(getQueryPath(paths.common.followUpQueryConfirmation, parentId));
    } catch (e) {
      next(e);
    }
  };
}

function getFollowUpConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
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
  router.post(paths.common.followUpQueryPermission, middleware, postFollowUpPermissionPage());
  router.get(paths.common.followUpQuery, middleware, getFollowUpPage);
  router.post(paths.common.followUpQueryUpload, middleware, uploadFollowUpEvidence());
  router.get(paths.common.followUpQueryDelete, middleware, deleteFollowUpEvidence());
  router.post(paths.common.followUpQuery, middleware, postFollowUpPage());
  router.get(paths.common.followUpQueryCya, middleware, getFollowUpCya);
  router.post(paths.common.followUpQueryCya, middleware, postFollowUpCya(updateAppealService, documentManagementService));
  router.get(paths.common.followUpQueryConfirmation, middleware, getFollowUpConfirmation);
  return router;
}

export {
  setupFollowUpQueryController
};
