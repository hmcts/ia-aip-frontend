import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { addDaysAndFormat, formatDate } from '../../utils/date-utils';

function getParentQuery(queries: QmQuery[], query: QmQuery) {
  if (query.parentId) {
    return queries.find(query => query.id === query.parentId);
  }
  return query;
}

function getChildQuery(queries: QmQuery[], query: QmQuery) {
  const sortedChildren: QmQuery[] = getChildrenQueries(queries, query);
  if (sortedChildren.length > 0) {
    return sortedChildren[sortedChildren.length - 1];
  }
  return query;
}

function getChildrenQueries(queries: QmQuery[], query: QmQuery) {
  return queries
    .filter(qmQuery => qmQuery?.parentId === query.id)
    .sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
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

function convertQueriesToTableValues(queries: QmQuery[]) {
  return queries
    .filter(qmQuery => !qmQuery.parentId)
    .map(query => {
        const parentQuery = getParentQuery(queries, query);
        const childQuery = getChildQuery(queries, query);
        return {
          id: query.id,
          subject: query.subject,
          createdBy: parentQuery.name,
          createdOn: formatDate(parentQuery.createdOn, true),
          updatedBy: childQuery.name,
          updatedOn: formatDate(childQuery.createdOn, true),
          status: getStatus(childQuery)
        };
      }
    );
}

function getViewQueriesPage(req: Request, res: Response, next: NextFunction) {
  const citizenQmQueries = req.session.appeal?.qmCitizenQueries?.caseMessages ? [...req.session.appeal.qmCitizenQueries.caseMessages] : [];
  const citizenQueries: TableQmQuery[] = convertQueriesToTableValues(citizenQmQueries);
  const legalRepQmQueries = req.session.appeal?.qmLegalRepresentativeQueries?.caseMessages ? [...req.session.appeal.qmLegalRepresentativeQueries.caseMessages] : [];
  const legalRepQueries: TableQmQuery[] = convertQueriesToTableValues(legalRepQmQueries);
  try {
    return res.render('query-management/view-queries.njk', {
      previousPage: paths.common.overview,
      citizenQueries: citizenQueries,
      legalRepQueries: legalRepQueries
    });
  } catch (e) {
    next(e);
  }
}

function formatQueryForView(query: QmQuery) {
  const newQuery: QmQuery = { ...query };
  if (query.hearingDate) {
    newQuery.hearingDate = formatDate(newQuery.hearingDate, true);
  }
  if (query.createdOn) {
    newQuery.createdOn = formatDate(newQuery.createdOn, true);
  }
  return newQuery;
}

function getViewQueryPage(req: Request, res: Response, next: NextFunction) {
  delete (req.session.appeal.messageSubject);
  delete (req.session.appeal.messageDetails);
  delete (req.session.appeal.messageDocs);

  const queryId = req.params.id;
  const queries = (req.session.appeal?.qmCitizenQueries?.caseMessages || []);
  const selectedParentQuery: QmQuery = formatQueryForView(queries.find(q => q.id === queryId));
  const childrenQueries: QmQuery[] = getChildrenQueries(queries, selectedParentQuery)
    .map(query => formatQueryForView(query));
  const latestChildQuery = childrenQueries.length > 0 ? childrenQueries[childrenQueries.length - 1] : selectedParentQuery;
  const latestChildStatus = getStatus(latestChildQuery);
  if (!selectedParentQuery) {
    return res.redirect(paths.common.viewQueries);
  }
  const renderObj = {
    previousPage: paths.common.viewQueries,
    parentQuery: selectedParentQuery,
    childrenQueries: childrenQueries,
    latestChildStatus: latestChildStatus,
    followUpPath: paths.common.followUpQuery.replace(':id', selectedParentQuery.id)
  };
  if (latestChildStatus === MessageStatus.CLOSED) {
    renderObj['closedQueryDate'] = latestChildQuery.createdOn;
  } else if ([MessageStatus.AWAITING_RESPONSE, MessageStatus.FOLLOW_UP_RESPONSE].includes(latestChildStatus)) {
    renderObj['responseByDate'] = addDaysAndFormat(latestChildQuery.createdOn, 10, true);
  }

  try {
    return res.render('query-management/view-query.njk', renderObj);
  } catch (e) {
    next(e);
  }
}

function setupViewQueryController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.viewQueries, middleware, getViewQueriesPage);
  router.get(paths.common.viewQuery, middleware, getViewQueryPage);
  return router;
}

export {
  setupViewQueryController
};
