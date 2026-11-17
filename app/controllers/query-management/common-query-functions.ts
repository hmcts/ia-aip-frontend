import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { deleteTemporaryQueryFields } from '../../utils/utils';

export function setMessageDetailsFromBody(req: Request, isInitialMessage: boolean) {
  req.session.appeal.messageDetails = req.body?.[i18n.pages.sendMessage.messageId];
  if (isInitialMessage) {
    req.session.appeal.messageSubject = req.body?.[i18n.pages.sendMessage.subjectId];
    req.session.appeal.isHearingRelated = req.body?.['isHearingRelated'];
    req.session.appeal.hearingDate = { day: req.body?.['day'], month: req.body?.['month'], year: req.body?.['year'] };
  }
}

export function getQueryPath(path: string, id: string) {
  return id ? path.replace(':id', id) : path;
}

export function uploadEvidence(path: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const isInitialMessage: boolean = !(req.params && Object.keys(req.params).includes('id'));
      setMessageDetailsFromBody(req, isInitialMessage);

      const queryPath = getQueryPath(path, req?.params ? req.params['id'] : undefined);
      if (req.file) {
        const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
        const id = messageDocs.length + 1;
        messageDocs.push({ ...req.file, id });
        req.session.appeal.messageDocs = messageDocs;
        return res.redirect(queryPath);
      } else if (res?.locals?.errorCode) {
        return res.redirect(`${queryPath}?errorCode=${res.locals.errorCode}`);
      } else {
        return res.redirect(`${queryPath}?errorCode=noFileSelected`);
      }
    } catch (e) {
      next(e);
    }
  };
}

export function deleteEvidence(path: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const queryPath = getQueryPath(path, req?.params ? req.params['id'] : undefined);
      if (req.query.id) {
        const messageDocs: MulterFile[] = req.session.appeal.messageDocs ? [...req.session.appeal.messageDocs] : [];
        req.session.appeal.messageDocs = messageDocs.filter(file => file.id != req.query.id)
          .map((doc, index) => {
            return { ...doc, id: (index + 1) };
          });
        return res.redirect(queryPath);
      } else {
        return res.redirect(`${queryPath}?errorCode=noFileExists`);
      }
    } catch (e) {
      next(e);
    }
  };
}

export function getAppellantFullName(req: Request) {
  const givenName = req.session.appeal?.application?.personalDetails?.givenNames || '';
  const familyName = req.session.appeal?.application?.personalDetails?.familyName || '';
  return `${givenName} ${familyName}`;
}

export async function postQuery(req: Request, specificQmFieldsToAdd: QmQuery, documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService, extraBody = '') {
  const body: string = extraBody + req.session.appeal.messageDetails;
  const qmQuery: QmQuery = {
    id: randomUUID(),
    body: body,
    name: getAppellantFullName(req),
    createdBy: req.idam.userDetails.uid,
    createdOn: new Date().toISOString(),
    ...specificQmFieldsToAdd
  };
  if (req.session.appeal?.messageDocs) {
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

  req.session.appeal = {
    ...req.session.appeal,
    ...appealUpdated
  };
  deleteTemporaryQueryFields(req);
}

export function getNameFromId(query: QmQuery, idamId: string) {
  return query?.createdBy === idamId ? 'You' : 'HMCTS Staff';
}