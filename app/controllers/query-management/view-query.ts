import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { addDaysAndFormat, formatDate } from '../../utils/date-utils';
import { deleteTemporaryQueryFields } from '../../utils/utils';
import { getNameFromId, getQueryPath } from './common-query-functions';

function getParentQuery(queries: QmQuery[], query: QmQuery): QmQuery {
  return queries.find(({ id }) => id === query.parentId) ?? query;
}

function getChildrenQueries(queries: QmQuery[], query: QmQuery) {
  return queries
    .filter(qmQuery => qmQuery?.parentId === query.id)
    .sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
}

function getChildQuery(queries: QmQuery[], query: QmQuery) {
  const sortedChildren: QmQuery[] = getChildrenQueries(queries, query);
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
      return MessageStatus.FOLLOW_UP_RESPONSE;
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
        const parentQuery = getParentQuery(queries, query);
        const childQuery = getChildQuery(queries, query);
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

function getViewQueriesPage(req: Request, res: Response, next: NextFunction) {
  const idamId: string = req.idam?.userDetails?.uid || '';
  const citizenQmQueries = req.session.appeal?.qmCitizenQueries?.caseMessages ? [...req.session.appeal.qmCitizenQueries.caseMessages] : [];
  const citizenQueries: TableQmQuery[] = convertQueriesToTableValues(citizenQmQueries, idamId);
  const legalRepQmQueries = req.session.appeal?.qmLegalRepresentativeQueries?.caseMessages ? [...req.session.appeal.qmLegalRepresentativeQueries.caseMessages] : [];
  const legalRepQueries: TableQmQuery[] = convertQueriesToTableValues(legalRepQmQueries, idamId);
  try {
    return res.render('query-management/view-queries.njk', {
      previousPage: paths.common.overview,
      citizenQueries: citizenQueries,
      oldLegalRepQueries: legalRepQueries
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

function getViewQueryPage(isCitizenQuery: boolean) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      deleteTemporaryQueryFields(req);
      const queries = (isCitizenQuery ? req.session.appeal?.qmCitizenQueries : req.session.appeal?.qmLegalRepresentativeQueries)?.caseMessages || [];
      const parentQueryId = req.params.id;
      const idamId: string = req.idam?.userDetails?.uid || '';
      const parentQuery: QmQuery = queries.find(q => q.id === parentQueryId);
      if (!parentQuery) {
        return res.redirect(paths.common.viewQueries);
      }
      const selectedParentQuery: QmQuery = formatQueryForView(parentQuery, idamId);
      const childrenQueries: QmQuery[] = getChildrenQueries(queries, selectedParentQuery)
        .map(query => formatQueryForView(query, idamId));
      const latestChildQuery = childrenQueries.length > 0 ? childrenQueries.at(-1) : selectedParentQuery;
      const latestChildStatus = getStatus(latestChildQuery);
      const renderObj = {
        previousPage: paths.common.viewQueries,
        parentQuery: selectedParentQuery,
        childrenQueries: childrenQueries,
        latestChildStatus: latestChildStatus,
        includeFollowUp: isCitizenQuery,
        followUpPath: getQueryPath(paths.common.followUpQueryPermission, selectedParentQuery.id),
        closeQueryPath: getQueryPath(paths.common.closeQuery, selectedParentQuery.id)
      };
      if (latestChildStatus === MessageStatus.CLOSED) {
        renderObj['closedQueryDate'] = latestChildQuery.createdOn;
      } else if ([MessageStatus.AWAITING_RESPONSE, MessageStatus.FOLLOW_UP_RESPONSE].includes(latestChildStatus)) {
        renderObj['responseByDate'] = addDaysAndFormat(latestChildQuery.createdOn, 10, true);
      }

      return res.render('query-management/view-query.njk', renderObj);
    } catch (e) {
      next(e);
    }
  };
}


function setupViewQueryController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.viewQueries, middleware, getViewQueriesPage);
  router.get(paths.common.viewQuery, middleware, getViewQueryPage(true));
  router.get(paths.common.viewLrQuery, middleware, getViewQueryPage(false));
  return router;
}

export {
  getParentQuery,
  getChildQuery,
  getChildrenQueries,
  getStatus,
  convertQueriesToTableValues,
  getViewQueriesPage,
  formatQueryForView,
  getViewQueryPage,
  setupViewQueryController
};
