import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment/moment';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addDaysToDate } from '../../utils/date-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getFileUploadError } from '../../utils/upload-utils';
import { formatTextForCYA, toIsoDate } from '../../utils/utils';
import {
  askQueryValidation,
  createStructuredError, followUpQueryValidation, futureDateValidation,
  messageSendValidation,
  statementValidation
} from '../../utils/validations/fields-validations';

function getPath(path: string, id: string) {
  return path.replace(':id', id);
}

function getFollowUpPermissionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    return res.render('query-management/send-message-permission.njk', {
      previousPage: getPath(paths.common.viewQuery, parentId)
    });
  } catch (e) {
    next(e);
  }
}

function postFollowUpPermissionPage() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const validation = statementValidation(req.body, i18n.validationErrors.sendMessagePermissionStatement);
      if (validation) {
        return res.render('query-management/send-message-permission.njk', {
          previousPage: getPath(paths.common.viewQuery, parentId),
          error: validation,
          errorList: Object.values(validation)
        });
      }

      return res.redirect(getPath(paths.common.followUpQuery, parentId));
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
      previousPage: getPath(paths.common.followUpQueryPermission, parentId),
      title: i18n.pages.followUpQueryTitle,
      subject: req.session.appeal?.messageSubject,
      details: req.session.appeal?.messageDetails,
      evidenceUploadAction: getPath(paths.common.followUpQueryUpload, parentId),
      evidences: req.session.appeal?.messageDocs || [],
      evidenceCTA: getPath(paths.common.followUpQueryDelete, parentId),
      shouldAskAboutHearing: false,
      formAction: getPath(paths.common.followUpQuery, parentId),
      errors: errCode ? errors : undefined,
      errorList: errCode ? Object.values(errors) : undefined
    });
  } catch (e) {
    next(e);
  }
}

function postFollowUpPage() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      req.session.appeal.messageSubject = req.body?.[i18n.pages.sendMessage.subjectId];
      req.session.appeal.messageDetails = req.body?.[i18n.pages.sendMessage.messageId];
      const validation: ValidationErrors = followUpQueryValidation(req.body);
      if (validation) {
        return res.render('query-management/send-message.njk', {
          previousPage: getPath(paths.common.followUpQueryPermission, parentId),
          title: i18n.pages.followUpQueryTitle,
          subject: req.body?.[i18n.pages.sendMessage.subjectId],
          details: req.body?.[i18n.pages.sendMessage.messageId],
          evidenceUploadAction: getPath(paths.common.followUpQueryUpload, parentId),
          evidences: req.session.appeal?.messageDocs || [],
          evidenceCTA: getPath(paths.common.followUpQueryDelete, parentId),
          shouldAskAboutHearing: false,
          formAction: getPath(paths.common.followUpQuery, parentId),
          errors: validation,
          errorList: Object.values(validation)
        });
      }
      return res.redirect(getPath(paths.common.followUpQueryCya, parentId));
    } catch (e) {
      next(e);
    }
  };
}

function uploadFollowUpEvidence() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.appeal.messageSubject = req.body?.[i18n.pages.sendMessage.subjectId];
      req.session.appeal.messageDetails = req.body?.[i18n.pages.sendMessage.messageId];
      const parentId = req.params['id'];
      if (req.file) {
        const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
        const id = messageDocs.length + 1;
        messageDocs.push({ ...req.file, id });
        req.session.appeal.messageDocs = messageDocs;
        return res.redirect(getPath(paths.common.followUpQuery, parentId));
      } else if (res.locals.errorCode) {
        return res.redirect(`${getPath(paths.common.followUpQuery, parentId)}?errorCode=${res.locals.errorCode}`);
      } else {
        return res.redirect(`${getPath(paths.common.followUpQuery, parentId)}?errorCode=noFileSelected`);
      }
    } catch (e) {
      next(e);
    }
  };
}

function deleteFollowUpEvidence() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      if (req.query.id) {
        const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
        req.session.appeal.messageDocs = messageDocs.filter(file => file.id != req.query.id)
          .map((doc, index) => {
            return { ...doc, id: (index + 1) };
          });
        return res.redirect(getPath(paths.common.followUpQuery, parentId));
      } else {
        return res.redirect(`${getPath(paths.common.followUpQuery, parentId)}?errorCode=noFileExists`);
      }
    } catch (e) {
      next(e);
    }
  };
}

function getFollowUpCya(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = req.params['id'];
    if (!req.session.appeal?.messageDetails || !req.session.appeal?.messageSubject) {
      return res.redirect(getPath(paths.common.followUpQuery, parentId));
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: getPath(paths.common.followUpQueryCya, parentId),
      previousPage: getPath(paths.common.followUpQuery, parentId),
      cancelPath: getPath(paths.common.viewQuery, parentId),
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

function getAppellantFullName(req: Request) {
  const personalDetails = req.session.appeal.application.personalDetails;
  return `${personalDetails.givenNames} ${personalDetails.familyName}`;
}

function postFollowUpCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.params['id'];
      const qmQuery: QmQuery = {
        id: randomUUID(),
        body: req.session.appeal.messageDetails,
        name: getAppellantFullName(req),
        subject: req.session.appeal.messageSubject,
        createdBy: req.idam.userDetails.uid,
        createdOn: new Date().toISOString(),
        messageType: 'Followup',
        parentId: parentId
      };
      if (req.session.appeal.messageDocs) {
        qmQuery.attachments = await documentManagementService.uploadFiles(req, req.session.appeal.messageDocs);
      }
      const appeal: Appeal = {
        ...req.session.appeal
      };
      if (req.session.appeal.qmCitizenQueries && req.session.appeal.qmCitizenQueries.caseMessages && req.session.appeal.qmCitizenQueries.caseMessages.length > 0) {
        appeal.qmCitizenQueries.caseMessages.push(qmQuery);
      } else {
        appeal.qmCitizenQueries = {
          roleOnCase: '',
          caseMessages: [qmQuery]
        };
      }

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.ASK_QUERY, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.refreshCasesList = true;

      delete (req.session.appeal.messageSubject);
      delete (req.session.appeal.messageDetails);
      delete (req.session.appeal.messageDocs);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(getPath(paths.common.followUpQueryConfirmation, parentId));
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
