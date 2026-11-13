import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { deleteTemporaryQueryFields } from '../../utils/utils';

export function setMessageDetailsFromBody(req: Request, hasHearingQuestions: boolean) {
  req.session.appeal.messageSubject = req.body?.[i18n.pages.sendMessage.subjectId];
  req.session.appeal.messageDetails = req.body?.[i18n.pages.sendMessage.messageId];
  if (hasHearingQuestions) {
    req.session.appeal.isHearingRelated = req.body?.['isHearingRelated'];
    req.session.appeal.hearingDate = { day: req.body?.['day'], month: req.body?.['month'], year: req.body?.['year'] };
  }
}

export function getQueryPath(path: string, id: string) {
  return path.replace(':id', id);
}

export function uploadEvidence(req: Request, res: Response, next: NextFunction) {
  const isFollowUpMessage: boolean = Object.keys(req.params).includes('id');
  try {
    setMessageDetailsFromBody(req, !isFollowUpMessage);
    const path = isFollowUpMessage ? getQueryPath(paths.common.followUpQuery, req.params['id']) : paths.common.sendMessage;
    if (req.file) {
      const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
      const id = messageDocs.length + 1;
      messageDocs.push({ ...req.file, id });
      req.session.appeal.messageDocs = messageDocs;
      return res.redirect(path);
    } else if (res.locals.errorCode) {
      return res.redirect(`${path}?errorCode=${res.locals.errorCode}`);
    } else {
      return res.redirect(`${path}?errorCode=noFileSelected`);
    }
  } catch (e) {
    next(e);
  }
}

export function deleteEvidence(req: Request, res: Response, next: NextFunction) {
  const isFollowUpMessage: boolean = Object.keys(req.params).includes('id');
  const path = isFollowUpMessage ? getQueryPath(paths.common.followUpQuery, req.params['id']) : paths.common.sendMessage;
  try {
    if (req.query.id) {
      const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
      req.session.appeal.messageDocs = messageDocs.filter(file => file.id != req.query.id)
        .map((doc, index) => {
          return { ...doc, id: (index + 1) };
        });
      return res.redirect(path);
    } else {
      return res.redirect(`${path}?errorCode=noFileExists`);
    }
  } catch (e) {
    next(e);
  }
}

export function getAppellantFullName(req: Request) {
  const personalDetails = req.session.appeal.application.personalDetails;
  return `${personalDetails.givenNames} ${personalDetails.familyName}`;
}

export async function postQuery(req: Request, specificQmFieldsToAdd: QmQuery, documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  const qmQuery: QmQuery = {
    id: randomUUID(),
    body: req.session.appeal.messageDetails,
    name: getAppellantFullName(req),
    subject: req.session.appeal.messageSubject,
    createdBy: req.idam.userDetails.uid,
    createdOn: new Date().toISOString(),
    ...specificQmFieldsToAdd
  };
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


  const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.ASK_QUERY, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
  req.session.refreshCasesList = true;

  deleteTemporaryQueryFields(req);
  req.session.appeal = {
    ...req.session.appeal,
    ...appealUpdated
  };
}