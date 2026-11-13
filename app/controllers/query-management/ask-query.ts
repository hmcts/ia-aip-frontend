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
  createStructuredError, futureDateValidation,
  messageSendValidation,
  statementValidation
} from '../../utils/validations/fields-validations';

function getAskQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    delete (req.session.appeal.messageSubject);
    delete (req.session.appeal.messageDetails);
    delete (req.session.appeal.messageDocs);
    delete (req.session.appeal.hearingDate);
    delete (req.session.appeal.isHearingRelated);
    return res.render('query-management/ask-query.njk', {
      previousPage: paths.common.overview,
      commonQueries: i18n.pages.askQuery.commonQueries
    });
  } catch (e) {
    next(e);
  }
}

function postAskQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = askQueryValidation(req.body);
    if (validation) {
      return res.render('query-management/ask-query.njk', {
        previousPage: paths.common.overview,
        commonQueries: i18n.pages.askQuery.commonQueries,
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    const chosenCommonQueryValue = i18n.pages.askQuery.commonQueries
      .some(query => query.value === req.body['queries']);
    if (chosenCommonQueryValue) {
      return res.redirect(`${paths.common.commonQueries}?queryValue=${req.body['queries']}`);
    } else {
      return res.redirect(paths.common.sendMessagePermission);
    }
  } catch (e) {
    next(e);
  }
}

function getCommonQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    const queryValue = req?.query?.['queryValue'];
    const queryObj = i18n.pages.askQuery.commonQueries
      .find(query => query.value === queryValue);
    if (!queryObj) {
      return res.redirect(paths.common.askQuery);
    }
    return res.render('query-management/common-query.njk', {
      previousPage: paths.common.askQuery,
      query: queryObj
    });
  } catch (e) {
    next(e);
  }
}

function getSendMessagePermissionPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('query-management/send-message-permission.njk', {
      previousPage: paths.common.askQuery
    });
  } catch (e) {
    next(e);
  }
}

function postSendMessagePermissionPage() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = statementValidation(req.body, i18n.validationErrors.sendMessagePermissionStatement);
      if (validation) {
        return res.render('query-management/send-message-permission.njk', {
          previousPage: paths.common.askQuery,
          error: validation,
          errorList: Object.values(validation)
        });
      }

      return res.redirect(paths.common.sendMessage);
    } catch (error) {
      next(error);
    }
  };
}

function getSendMessagePage(req: Request, res: Response, next: NextFunction) {
  try {
    const errCode: string = req?.query['errorCode'] as string;
    const errors = { 'file-upload': createStructuredError('file-upload', getFileUploadError(errCode)) };
    return res.render('query-management/send-message.njk', {
      previousPage: paths.common.sendMessagePermission,
      title: i18n.pages.sendMessage.title,
      subject: req.session.appeal?.messageSubject,
      details: req.session.appeal?.messageDetails,
      evidenceUploadAction: paths.common.sendMessageUpload,
      evidences: req.session.appeal?.messageDocs || [],
      evidenceCTA: paths.common.sendMessageDelete,
      shouldAskAboutHearing: true,
      hearingDate: req.session.appeal?.hearingDate,
      isHearingRelated: req.session.appeal?.isHearingRelated,
      formAction: paths.common.sendMessage,
      errors: errCode ? errors : undefined,
      errorList: errCode ? Object.values(errors) : undefined
    });
  } catch (e) {
    next(e);
  }
}

function postSendMessagePage() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.appeal.messageSubject = req.body?.[i18n.pages.sendMessage.subjectId];
      req.session.appeal.messageDetails = req.body?.[i18n.pages.sendMessage.messageId];
      req.session.appeal.isHearingRelated = req.body?.['isHearingRelated'];
      req.session.appeal.hearingDate = { day: req.body?.['day'], month: req.body?.['month'], year: req.body?.['year'] };
      let validation: ValidationErrors = messageSendValidation(req.body);
      if (req.body?.['isHearingRelated'] == 'Yes') {
        const dateValidation: ValidationErrors = futureDateValidation(req.body);
        if (validation || dateValidation) {
          validation = { ...validation, ...dateValidation };
        }
      }
      if (validation) {
        const hearingDateKeys = ['isHearingRelated', 'date', 'day', 'month', 'year'];
        let hearingErrorMessage: string;
        for (const key of hearingDateKeys) {
          if (validation[key]) {
            hearingErrorMessage = validation[key].text;
            break;
          }
        }
        return res.render('query-management/send-message.njk', {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: req.body?.[i18n.pages.sendMessage.subjectId],
          details: req.body?.[i18n.pages.sendMessage.messageId],
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: req.session.appeal?.messageDocs || [],
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          isHearingRelated: req.session.appeal?.isHearingRelated,
          hearingDate: req.session.appeal?.hearingDate,
          hearingErrorMessage: hearingErrorMessage,
          formAction: paths.common.sendMessage,
          errors: validation,
          errorList: Object.values(validation)
        });
      }
      return res.redirect(paths.common.sendMessageCya);
    } catch (e) {
      next(e);
    }
  };
}

function uploadSendMessageEvidence() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.appeal.messageSubject = req.body?.[i18n.pages.sendMessage.subjectId];
      req.session.appeal.messageDetails = req.body?.[i18n.pages.sendMessage.messageId];
      req.session.appeal.isHearingRelated = req.body?.['isHearingRelated'];
      req.session.appeal.hearingDate = { day: req.body?.['day'], month: req.body?.['month'], year: req.body?.['year'] };

      if (req.file) {
        const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
        const id = messageDocs.length + 1;
        messageDocs.push({ ...req.file, id });
        req.session.appeal.messageDocs = messageDocs;
        return res.redirect(paths.common.sendMessage);
      } else if (res.locals.errorCode) {
        return res.redirect(`${paths.common.sendMessage}?errorCode=${res.locals.errorCode}`);
      } else {
        return res.redirect(`${paths.common.sendMessage}?errorCode=noFileSelected`);
      }
    } catch (e) {
      next(e);
    }
  };
}

function deleteSendMessageEvidence() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
        req.session.appeal.messageDocs = messageDocs.filter(file => file.id != req.query.id)
          .map((doc, index) => {
            return { ...doc, id: (index + 1) };
          });
        return res.redirect(paths.common.sendMessage);
      } else {
        return res.redirect(`${paths.common.sendMessage}?errorCode=noFileExists`);
      }
    } catch (e) {
      next(e);
    }
  };
}

function getSendMessageCya(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.appeal?.messageDetails || !req.session.appeal?.messageSubject || !req.session.appeal?.isHearingRelated) {
      return res.redirect(paths.common.sendMessage);
    }
    const summaryRows: SummaryRow[] = buildSummaryRows(req);
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.checkYourAnswers.title,
      continuePath: paths.common.sendMessageCya,
      previousPage: paths.common.sendMessage,
      cancelPath: paths.common.overview,
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
      paths.common.sendMessage
    ),
    addSummaryRow(
      i18n.pages.sendMessage.messageLabel,
      [formatTextForCYA(req.session.appeal.messageDetails)],
      paths.common.sendMessage
    ),
    addSummaryRow(
      i18n.pages.sendMessage.isHearingRelated.label,
      [formatTextForCYA(req.session.appeal.isHearingRelated)],
      paths.common.sendMessage
    )
  ];

  if (req.session.appeal.isHearingRelated == 'Yes') {
    const hearingDate: AppealDate = req.session.appeal.hearingDate;
    summaryRows.push(addSummaryRow(
      i18n.pages.sendMessage.isHearingRelated.dateCya,
      [hearingDate.day, moment.months(Number.parseInt(hearingDate.month, 10) - 1), hearingDate.year],
      paths.common.sendMessage,
      Delimiter.SPACE));
  }

  if (req.session.appeal?.messageDocs && req.session.appeal?.messageDocs.length > 0) {
    const evidenceText = req.session.appeal.messageDocs.map((evidence) => evidence.originalname);
    summaryRows.push(addSummaryRow(i18n.pages.sendMessage.uploadDocsCya, evidenceText, paths.common.sendMessage, Delimiter.BREAK_LINE));
  }

  return summaryRows;
}

function getAppellantFullName(req: Request) {
  const personalDetails = req.session.appeal.application.personalDetails;
  return `${personalDetails.givenNames} ${personalDetails.familyName}`;
}

function postSendMessageCya(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const qmQuery: QmQuery = {
        id: randomUUID(),
        body: req.session.appeal.messageDetails,
        name: getAppellantFullName(req),
        subject: req.session.appeal.messageSubject,
        createdBy: req.idam.userDetails.uid,
        createdOn: new Date().toISOString(),
        messageType: 'NewQuery',
        isHearingRelated: req.session.appeal.isHearingRelated
      };
      if (req.session.appeal.isHearingRelated == 'Yes') {
        qmQuery.hearingDate = toIsoDate(req.session.appeal.hearingDate);
      }
      if (req.session.appeal.messageDocs) {
        qmQuery.attachments = await documentManagementService.uploadFiles(req, req.session.appeal.messageDocs);
      }
      const appeal: Appeal = {
        ...req.session.appeal
      };
      if (req.session.appeal?.qmCitizenQueries?.caseMessages?.length > 0) {
        appeal.qmCitizenQueries.caseMessages.push(qmQuery);
      } else {
        appeal.qmCitizenQueries = {
          roleOnCase: '',
          caseMessages: [qmQuery]
        };
      }

      delete (req.session.appeal.messageSubject);
      delete (req.session.appeal.messageDetails);
      delete (req.session.appeal.messageDocs);
      delete (req.session.appeal.hearingDate);
      delete (req.session.appeal.isHearingRelated);

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.ASK_QUERY, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.refreshCasesList = true;

      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(paths.common.sendMessageConfirmation);
    } catch (e) {
      next(e);
    }
  };
}

function getSendMessageConfirmation(req: Request, res: Response, next: NextFunction) {
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

function setupAskQueryController(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.askQuery, middleware, getAskQueryPage);
  router.post(paths.common.askQuery, middleware, postAskQueryPage);
  router.get(paths.common.commonQueries, middleware, getCommonQueryPage);
  router.get(paths.common.sendMessagePermission, middleware, getSendMessagePermissionPage);
  router.post(paths.common.sendMessagePermission, middleware, postSendMessagePermissionPage());
  router.get(paths.common.sendMessage, middleware, getSendMessagePage);
  router.post(paths.common.sendMessageUpload, middleware, uploadSendMessageEvidence());
  router.get(paths.common.sendMessageDelete, middleware, deleteSendMessageEvidence());
  router.post(paths.common.sendMessage, middleware, postSendMessagePage());
  router.get(paths.common.sendMessageCya, middleware, getSendMessageCya);
  router.post(paths.common.sendMessageCya, middleware, postSendMessageCya(updateAppealService, documentManagementService));
  router.get(paths.common.sendMessageConfirmation, middleware, getSendMessageConfirmation);
  return router;
}

export {
  setupAskQueryController
};
