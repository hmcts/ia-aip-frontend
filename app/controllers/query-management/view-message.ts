import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysAndFormat, formatDate } from '../../utils/date-utils';
import { deleteTemporaryMessageFields } from '../../utils/utils';
import { getNameFromId, getMessagePath } from './common-message-functions';

function getParentMessage(queries: QmQuery[], query: QmQuery): QmQuery {
  return queries.find(({ id }) => id === query.parentId) ?? query;
}

function getChildrenMessages(queries: QmQuery[], query: QmQuery) {
  return queries
    .filter(qmQuery => qmQuery?.parentId === query.id)
    .sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
}

function getChildMessage(queries: QmQuery[], query: QmQuery) {
  const sortedChildren: QmQuery[] = getChildrenMessages(queries, query);
  if (sortedChildren.length > 0) {
    return sortedChildren.at(-1);
  }
  return query;
}

enum MessageStatus {
  CLOSED = 'Closed',
  AWAITING_RESPONSE = 'Awaiting response',
  RESPONDED = 'Responded',
  FOLLOW_UP_RESPONSE = 'Awaiting response to follow-up',
  CLOSURE_REQUEST = 'Awaiting response to closure request',
  UNKNOWN = 'Unknown'
}

function getStatus(query: QmQuery): MessageStatus {
  if (query?.isClosed == 'Yes') {
    return MessageStatus.CLOSED;
  }
  switch (query.messageType) {
    case 'NewQuery':
      return MessageStatus.AWAITING_RESPONSE;
    case 'Respond':
      return MessageStatus.RESPONDED;
    case 'Followup':
      return query?.body?.startsWith(i18n.pages.closeMessage.messageDetailsPrefix) ? MessageStatus.CLOSURE_REQUEST : MessageStatus.FOLLOW_UP_RESPONSE;
    case 'NewQueryQualifyingQuestionOptions':
    case 'NewQueryQualifyingQuestionDetail':
    case 'HMCTS':
      return MessageStatus.UNKNOWN;
  }
}

function convertQueriesToTableValues(queries: QmQuery[], idamId: string) {
  return queries
    .filter(qmQuery => !qmQuery.parentId)
    .map(query => {
        const parentQuery = getParentMessage(queries, query);
        const childQuery = getChildMessage(queries, query);
        return {
          id: query.id,
          subject: query.subject,
          createdBy: getNameFromId(parentQuery, idamId),
          createdOn: formatDate(parentQuery.createdOn, true),
          updatedBy: getNameFromId(childQuery, idamId),
          updatedOn: formatDate(childQuery.createdOn, true),
          status: getStatus(childQuery)
        };
      }
    );
}

function getViewMessagesPage(req: Request, res: Response, next: NextFunction) {
  const idamId: string = req.idam?.userDetails?.uid || '';
  const citizenQmQueries = req.session.appeal?.qmCitizenQueries?.caseMessages ? [...req.session.appeal.qmCitizenQueries.caseMessages] : [];
  const citizenMessages: TableQmMessage[] = convertQueriesToTableValues(citizenQmQueries, idamId);
  const legalRepQmQueries = req.session.appeal?.qmLegalRepresentativeQueries?.caseMessages ? [...req.session.appeal.qmLegalRepresentativeQueries.caseMessages] : [];
  const legalRepMessages: TableQmMessage[] = convertQueriesToTableValues(legalRepQmQueries, idamId);
  try {
    return res.render('query-management/view-messages.njk', {
      previousPage: paths.common.overview,
      citizenQueries: citizenMessages,
      // TODO remove this if not wanting to see old LR messages
      oldLegalRepQueries: legalRepMessages
    });
  } catch (e) {
    next(e);
  }
}

function formatQueryForView(query: QmQuery, idamId: string) {
  const newQuery: QmQuery = { ...query };
  if (query.hearingDate) {
    newQuery.hearingDate = formatDate(newQuery.hearingDate, true);
  }
  if (query.createdOn) {
    newQuery.createdOn = formatDate(newQuery.createdOn, true);
  }
  if (query.createdBy) {
    newQuery.name = getNameFromId(newQuery, idamId);
  }
  return newQuery;
}

function getViewMessagePage(isCitizenQuery: boolean) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      deleteTemporaryMessageFields(req);
      const queries = (isCitizenQuery ? req.session.appeal?.qmCitizenQueries : req.session.appeal?.qmLegalRepresentativeQueries)?.caseMessages || [];
      const parentQueryId = req.params.id;
      const idamId: string = req.idam?.userDetails?.uid || '';
      const parentQuery: QmQuery = queries.find(q => q.id === parentQueryId);
      if (!parentQuery) {
        return res.redirect(paths.common.viewMessages);
      }
      const selectedParentQuery: QmQuery = formatQueryForView(parentQuery, idamId);
      const childrenQueries: QmQuery[] = getChildrenMessages(queries, selectedParentQuery)
        .map(query => formatQueryForView(query, idamId));
      const latestChildQuery = childrenQueries.length > 0 ? childrenQueries.at(-1) : selectedParentQuery;
      const latestChildStatus = getStatus(latestChildQuery);
      const renderObj = {
        previousPage: paths.common.viewMessages,
        parentQuery: selectedParentQuery,
        childrenQueries: childrenQueries,
        latestChildStatus: latestChildStatus,
        includeFollowUp: isCitizenQuery,
        followUpPath: getMessagePath(paths.common.followUpMessagePermission, selectedParentQuery.id),
        closeMessagePath: getMessagePath(paths.common.closeMessage, selectedParentQuery.id)
      };
      if (latestChildStatus === MessageStatus.CLOSED) {
        renderObj['closedMessageDate'] = latestChildQuery.createdOn;
      } else {
        renderObj['responseByDate'] = addDaysAndFormat(latestChildQuery.createdOn, 10, true);
      }

      return res.render('query-management/view-message.njk', renderObj);
    } catch (e) {
      next(e);
    }
  };
}


function setupViewMessageController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.viewMessages, middleware, getViewMessagesPage);
  router.get(paths.common.viewMessage, middleware, getViewMessagePage(true));
  // TODO remove this if not wanting to see old LR queries
  router.get(paths.common.viewLrMessage, middleware, getViewMessagePage(false));
  return router;
}

export {
  getParentMessage,
  getChildMessage,
  getChildrenMessages,
  getStatus,
  convertQueriesToTableValues,
  getViewMessagesPage,
  formatQueryForView,
  getViewMessagePage,
  setupViewMessageController
};
