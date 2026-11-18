import { Request, Response } from 'express';
import { Session } from 'express-session';
import {
  convertQueriesToTableValues,
  formatQueryForView,
  getChildQuery,
  getChildrenQueries,
  getParentQuery,
  getStatus,
  getViewQueriesPage,
  getViewQueryPage,
  setupViewQueryController
} from '../../../../app/controllers/query-management/view-query';
import { paths } from '../../../../app/paths';
import { createQueryMock, expect, makeFileMock, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('View queries controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  const hearingDate: AppealDate = { day: '01', month: '01', year: '1999' };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {} as Partial<Appeal>
      } as Partial<Session>,
      query: {},
      params: {
        id: '1234'
      },
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'citizenIdamUid'
        } as Partial<IdamDetails>
      }
    } as Partial<Request>;

    redirectStub = sandbox.stub();
    renderStub = sandbox.stub();
    res = {
      redirect: redirectStub,
      render: renderStub,
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getParentQuery', () => {
    it('getParentQuery returns correctly', () => {
      const queryOne = { id: 'childId', parentId: 'parentId' };
      const queryTwo = { id: 'parentId' };
      const queryThree = { id: 'childTwoId', parentId: 'missingParentId' };
      const queries = [queryOne, queryTwo, queryThree];
      const returnQueryOne = getParentQuery(queries, queryOne);
      const returnQueryTwo = getParentQuery(queries, queryTwo);
      const returnQueryThree = getParentQuery(queries, queryThree);
      expect(returnQueryOne).to.deep.equal(queryTwo);
      expect(returnQueryTwo).to.deep.equal(queryTwo);
      expect(returnQueryThree).to.deep.equal(queryThree);
    });
  });

  describe('getChildrenQueries', () => {
    it('getChildrenQueries filters and sorts old to new correctly', () => {
      const dateTimeNow = new Date(2021, 1, 1, 5, 10, 30);
      const dateTimePast = new Date(2021, 1, 1, 5, 5, 30);
      const dateTimeFuture = new Date(2021, 1, 1, 5, 20, 30);
      const queryOne = { id: 'childId', parentId: 'parentId', createdOn: dateTimeNow.toISOString() };
      const queryTwo = { id: 'parentId', createdOn: dateTimeNow.toISOString() };
      const queryThree = { id: 'childTwoId', parentId: 'parentId', createdOn: dateTimeFuture.toISOString() };
      let queries = [queryOne, queryTwo, queryThree];
      const returnQueryOne = getChildrenQueries(queries, queryOne);
      let returnQueryTwo = getChildrenQueries(queries, queryTwo);
      const returnQueryThree = getChildrenQueries(queries, queryThree);
      expect(returnQueryOne).to.deep.equal([]);
      expect(returnQueryTwo).to.deep.equal([queryOne, queryThree]);
      expect(returnQueryThree).to.deep.equal([]);

      queryThree.createdOn = dateTimePast.toISOString();
      queries = [queryOne, queryTwo, queryThree];
      returnQueryTwo = getChildrenQueries(queries, queryTwo);
      expect(returnQueryTwo).to.deep.equal([queryThree, queryOne]);
    });
  });

  describe('getChildQuery', () => {
    it('getChildQuery filters and sorts old to new correctly and returns newest object', () => {
      const dateTimeNow = new Date(2021, 1, 1, 5, 10, 30);
      const dateTimePast = new Date(2021, 1, 1, 5, 5, 30);
      const dateTimeFuture = new Date(2021, 1, 1, 5, 20, 30);
      const queryOne = { id: 'childId', parentId: 'parentId', createdOn: dateTimeNow.toISOString() };
      const queryTwo = { id: 'parentId', createdOn: dateTimeNow.toISOString() };
      const queryThree = { id: 'childTwoId', parentId: 'parentId', createdOn: dateTimeFuture.toISOString() };
      let queries = [queryOne, queryTwo, queryThree];
      const returnQueryOne = getChildQuery(queries, queryOne);
      let returnQueryTwo = getChildQuery(queries, queryTwo);
      const returnQueryThree = getChildQuery(queries, queryThree);
      expect(returnQueryOne).to.deep.equal(queryOne);
      expect(returnQueryTwo).to.deep.equal(queryThree);
      expect(returnQueryThree).to.deep.equal(queryThree);

      queryThree.createdOn = dateTimePast.toISOString();
      queries = [queryOne, queryTwo, queryThree];
      returnQueryTwo = getChildQuery(queries, queryTwo);
      expect(returnQueryTwo).to.deep.equal(queryOne);
    });
  });

  describe('getStatus', () => {
    it('should return correct values if not closed', () => {
      const query = { messageType: 'NewQuery' };
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Awaiting response');
      query.messageType = 'Respond';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Responded');
      query.messageType = 'Followup';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Awaiting response to follow-up');
      query['body'] = 'Request for query closure. Some reason.';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Awaiting response to closure request');
      query.messageType = 'NewQueryQualifyingQuestionOptions';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Unknown');
      query.messageType = 'NewQueryQualifyingQuestionDetail';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Unknown');
      query.messageType = 'HMCTS';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Unknown');
    });

    it('should return correct values if closed', () => {
      const query = { messageType: 'NewQuery', isClosed: 'Yes' };
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Closed');
      query.messageType = 'Respond';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Closed');
      query.messageType = 'Followup';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Closed');
      query.messageType = 'NewQueryQualifyingQuestionOptions';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Closed');
      query.messageType = 'NewQueryQualifyingQuestionDetail';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Closed');
      query.messageType = 'HMCTS';
      expect(getStatus(query as Partial<QmQuery>)).to.equal('Closed');
    });
  });

  function createTableQueryMock(suffix: string, createdByCitizen?: boolean, updatedByCitizen?: boolean, createdFutureDate?: boolean, updatedFutureDate?: boolean, status?: string) {
    return {
      id: 'someId' + suffix,
      subject: 'someSubject' + suffix,
      createdBy: createdByCitizen ? 'You' : 'HMCTS Staff',
      createdOn: createdFutureDate ? '02 March 2030' : '01 February 2026',
      updatedBy: updatedByCitizen ? 'You' : 'HMCTS Staff',
      updatedOn: updatedFutureDate ? '02 March 2030' : '01 February 2026',
      status: status
    };
  }

  describe('convertQueriesToTableValues', () => {
    it('convertQueriesToTableValues filters correctly', () => {
      const queryOne = createQueryMock('One', true, 'someIdTwo', false, true, true);
      const queryTwo = createQueryMock('Two', false, '', true);
      const queryThree = createQueryMock('Three', false);
      const queries = [queryOne, queryThree, queryTwo];
      const final = convertQueriesToTableValues(queries, 'citizenIdamUid');
      expect(final).to.have.length(2);
      expect(final).to.deep.equal([
        createTableQueryMock('Three', false, false, false, false, 'Awaiting response'),
        createTableQueryMock('Two', true, false, false, true, 'Closed'),
      ]);
    });
  });

  describe('getViewQueriesPage', () => {
    it('getViewQueriesPage renders with empty table if no queries', () => {
      getViewQueriesPage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/view-queries.njk', {
        previousPage: paths.common.overview,
        citizenQueries: [],
        oldLegalRepQueries: []
      });
    });

    it('getViewQueriesPage renders with non-empty table if queries', () => {
      const citizenQueries = [createQueryMock('One'), createQueryMock('Two')];
      const lrQueries = [createQueryMock('Three')];
      req.session.appeal.qmCitizenQueries = { roleOnCase: '', caseMessages: citizenQueries };
      req.session.appeal.qmLegalRepresentativeQueries = { roleOnCase: '', caseMessages: lrQueries };
      getViewQueriesPage(req as Request, res as Response, next);

      const citizenTable = convertQueriesToTableValues(citizenQueries, 'someIdamId');
      const lrTable = convertQueriesToTableValues(lrQueries, 'someIdamId');
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/view-queries.njk', {
        previousPage: paths.common.overview,
        citizenQueries: citizenTable,
        oldLegalRepQueries: lrTable
      });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getViewQueriesPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('formatQueryForView', () => {
    it('returns same object if no values to format', () => {
      const query: QmQuery = createQueryMock('', false, '', true);
      query.createdOn = undefined;
      query.createdBy = undefined;
      const newQ = formatQueryForView(query, 'citizenIdamUid');

      expect(newQ).to.deep.equal(query);
    });

    it('returns formatted object if values to format', () => {
      const query: QmQuery = createQueryMock('', false, '', true);
      query.hearingDate = '2020-10-01';
      query.createdOn = new Date(2019, 10, 11).toISOString();
      query.createdBy = 'citizenIdamUid';
      const newQ = formatQueryForView(query, 'citizenIdamUid');

      expect(newQ).to.not.deep.equal(query);
      expect(newQ.id).to.equal(query.id);
      expect(newQ.body).to.equal(query.body);
      expect(newQ.name).to.not.equal(query.name);
      expect(newQ.name).to.equal('You');
      expect(newQ.subject).to.equal(query.subject);
      expect(newQ.createdBy).to.equal(query.createdBy);
      expect(newQ.createdOn).to.not.equal(query.createdOn);
      expect(newQ.createdOn).to.equal('11 November 2019');
      expect(newQ.attachments).to.equal(query.attachments);
      expect(newQ.messageType).to.equal(query.messageType);
      expect(newQ.isHearingRelated).to.equal(query.isHearingRelated);
      expect(newQ.hearingDate).to.not.equal(query.hearingDate);
      expect(newQ.hearingDate).to.equal('01 October 2020');
      expect(newQ.isClosed).to.equal(query.isClosed);
      expect(newQ.parentId).to.equal(query.parentId);
    });
  });

  describe('getViewQueryPage', () => {
    const queryOne = createQueryMock('One', true, 'someIdTwo', false, true, true);
    const queryTwo = createQueryMock('Two', false, '', true);
    const queryThree = createQueryMock('Three', false);
    const queries = [queryOne, queryThree, queryTwo];
    it('getViewQueryPage redirects to viewQueries if no valid parent query', () => {
      req.session.appeal.messageSubject = 'someValue';
      req.session.appeal.messageDetails = 'someValue';
      req.session.appeal.messageDocs = [makeFileMock('')];
      req.session.appeal.hearingDate = hearingDate;
      req.session.appeal.isHearingRelated = 'Yes';

      getViewQueryPage(false)(req as Request, res as Response, next);

      expect(req.session.appeal.messageSubject).to.be.undefined;
      expect(req.session.appeal.messageDetails).to.be.undefined;
      expect(req.session.appeal.messageDocs).to.be.undefined;
      expect(req.session.appeal.hearingDate).to.be.undefined;
      expect(req.session.appeal.isHearingRelated).to.be.undefined;

      expect(renderStub).to.not.be.called;
      expect(redirectStub).to.be.calledOnceWith(paths.common.viewQueries);
    });

    it('getViewQueryPage renders to page if valid parent query One', () => {
      req.session.appeal.qmCitizenQueries = { roleOnCase: '', caseMessages: queries };
      req.params.id = queryOne.id;
      getViewQueryPage(true)(req as Request, res as Response, next);

      expect(redirectStub).to.not.be.called;
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/view-query.njk', {
        'childrenQueries': [],
        'closeQueryPath': '/close-query/' + queryOne.id,
        'closedQueryDate': '02 March 2030',
        'followUpPath': '/follow-up-query-permission/' + queryOne.id,
        'includeFollowUp': true,
        'latestChildStatus': 'Closed',
        'parentQuery': formatQueryForView(queryOne, 'citizenIdamUid'),
        'previousPage': '/view-queries'
      });
    });

    it('getViewQueryPage renders to page if valid parent query Two', () => {
      req.session.appeal.qmCitizenQueries = { roleOnCase: '', caseMessages: queries };
      req.params.id = queryTwo.id;
      getViewQueryPage(true)(req as Request, res as Response, next);

      expect(redirectStub).to.not.be.called;
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/view-query.njk', {
        'childrenQueries': [formatQueryForView(queryOne, 'citizenIdamUid')],
        'closeQueryPath': '/close-query/' + queryTwo.id,
        'closedQueryDate': '02 March 2030',
        'followUpPath': '/follow-up-query-permission/' + queryTwo.id,
        'includeFollowUp': true,
        'latestChildStatus': 'Closed',
        'parentQuery': formatQueryForView(queryTwo, 'citizenIdamUid'),
        'previousPage': '/view-queries'
      });
    });

    it('getViewQueryPage renders to page if valid parent query Three', () => {
      req.session.appeal.qmCitizenQueries = { roleOnCase: '', caseMessages: queries };
      req.params.id = queryThree.id;
      getViewQueryPage(true)(req as Request, res as Response, next);

      expect(redirectStub).to.not.be.called;
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/view-query.njk', {
        'childrenQueries': [],
        'responseByDate': '11 February 2026',
        'closeQueryPath': '/close-query/' + queryThree.id,
        'followUpPath': '/follow-up-query-permission/' + queryThree.id,
        'includeFollowUp': true,
        'latestChildStatus': 'Awaiting response',
        'parentQuery': formatQueryForView(queryThree, 'citizenIdamUid'),
        'previousPage': '/view-queries'
      });
    });

    it('getViewQueryPage redirects if LR with only citizen queries', () => {
      req.session.appeal.qmCitizenQueries = { roleOnCase: '', caseMessages: queries };
      req.params.id = queryThree.id;

      getViewQueryPage(false)(req as Request, res as Response, next);

      expect(renderStub).to.not.be.called;
      expect(redirectStub).to.be.calledOnceWith(paths.common.viewQueries);
    });

    it('getViewQueryPage redirects if citizen with only LR queries', () => {
      req.session.appeal.qmLegalRepresentativeQueries = { roleOnCase: '', caseMessages: queries };
      req.params.id = queryThree.id;

      getViewQueryPage(true)(req as Request, res as Response, next);

      expect(renderStub).to.not.be.called;
      expect(redirectStub).to.be.calledOnceWith(paths.common.viewQueries);
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      req.session.appeal.qmCitizenQueries = { roleOnCase: '', caseMessages: queries };
      req.params.id = queryThree.id;

      getViewQueryPage(true)(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('setupViewQueryController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupViewQueryController([]);
      expect(routerGetStub.calledWith(paths.common.viewQueries, [], getViewQueriesPage)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.viewQuery)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.viewLrQuery)).to.equal(true);
    });
  });
});