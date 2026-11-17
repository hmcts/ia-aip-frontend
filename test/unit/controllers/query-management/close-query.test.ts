import { Request, Response } from 'express';
import { Session } from 'express-session';
import {
  buildSummaryRows,
  getCloseQueryConfirmation,
  getCloseQueryCya,
  getCloseQueryPage,
  postCloseQueryCya,
  postCloseQueryPage,
  setupCloseQueryController
} from '../../../../app/controllers/query-management/close-query';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { buildExpectedError, buildExpectedRequiredError, expect, makeFileMock, sinon } from '../../../utils/testUtils';
const express = require('express');

describe('Close query controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
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
          uid: 'idamUID'
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

  describe('getCloseQueryPage', () => {
    it('getCloseQueryPage renders with empty fields and no errors', () => {
      getCloseQueryPage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: '/view-query/1234',
          title: i18n.pages.closeQuery.title,
          customHint: i18n.pages.closeQuery.help,
          customLabel: i18n.pages.closeQuery.desc,
          hasSubject: false,
          details: undefined,
          evidenceUploadAction: '/close-query/upload/1234',
          evidences: [],
          evidenceCTA: '/close-query/delete/1234',
          shouldAskAboutHearing: false,
          formAction: '/close-query/1234',
          errors: undefined,
          errorList: undefined
        });
    });

    it('getCloseQueryPage renders with non-empty fields and errors', () => {
      req.query['errorCode'] = 'someErrorCode';
      req.session.appeal.messageSubject = 'someSubject';
      req.session.appeal.messageDetails = 'someDetails';
      const fileOne = makeFileMock('one');
      const fileTwo = makeFileMock('two');
      req.session.appeal.messageDocs = [fileOne, fileTwo];
      req.session.appeal.hearingDate = { day: '1', month: '2', year: '1999' };
      req.session.appeal.isHearingRelated = 'Yes';

      getCloseQueryPage(req as Request, res as Response, next);

      const error = buildExpectedError('file-upload', i18n.validationErrors.fileUpload.noFileSelected);
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: '/view-query/1234',
          title: i18n.pages.closeQuery.title,
          customHint: i18n.pages.closeQuery.help,
          customLabel: i18n.pages.closeQuery.desc,
          hasSubject: false,
          details: 'someDetails',
          evidenceUploadAction: '/close-query/upload/1234',
          evidences: [fileOne, fileTwo],
          evidenceCTA: '/close-query/delete/1234',
          shouldAskAboutHearing: false,
          formAction: '/close-query/1234',
          errors: { 'file-upload': error },
          errorList: [error]
        });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getCloseQueryPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postCloseQueryPage', () => {
    it('postCloseQueryPage renders with error if base validation fails with empty fields', () => {
      postCloseQueryPage(req as Request, res as Response, next);
      const detailsError = buildExpectedRequiredError('messageDetails');
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: '/view-query/1234',
          title: i18n.pages.closeQuery.title,
          customHint: i18n.pages.closeQuery.help,
          customLabel: i18n.pages.closeQuery.desc,
          hasSubject: false,
          details: undefined,
          evidenceUploadAction: '/close-query/upload/1234',
          evidences: [],
          evidenceCTA: '/close-query/delete/1234',
          shouldAskAboutHearing: false,
          formAction: '/close-query/1234',
          errors: { messageDetails: detailsError },
          errorList: [detailsError]
        });
    });

    it('postCloseQueryPage redirects to cya if all valid', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.session.appeal.messageDocs = [makeFileMock('')];

      postCloseQueryPage(req as Request, res as Response, next);

      expect(renderStub).to.not.be.called;
      expect(redirectStub).to.be.calledOnceWith('/close-query/confirm/1234');
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      postCloseQueryPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getCloseQueryCya', () => {
    it('getCloseQueryCya redirects back to sendMessage if missing messageDetails from req', () => {
      getCloseQueryCya(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/close-query/1234');
      expect(renderStub).not.to.be.called;
    });

    it('getCloseQueryCya renders cya with summary rows', () => {
      req.session.appeal.messageDetails = 'something';
      req.session.appeal.messageSubject = 'something';
      req.session.appeal.isHearingRelated = 'No';

      getCloseQueryCya(req as Request, res as Response, next);

      expect(redirectStub).not.to.be.called;
      expectRenderedCalledOnceWithArgs(renderStub, 'templates/check-and-send.njk', {
        pageTitle: i18n.pages.checkYourAnswers.title,
        continuePath: '/close-query/confirm/1234',
        previousPage: '/close-query/1234',
        cancelPath: '/view-query/1234',
        noContactUs: true,
        summaryRows: sinon.match.any
      });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      getCloseQueryCya(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('buildSummaryRows', () => {
    it('builds correct summary rows with  hearing related and no docs', () => {
      req.session.appeal.messageSubject = 'subject';
      req.session.appeal.messageDetails = 'details';
      req.session.appeal.isHearingRelated = 'Yes';
      req.session.appeal.hearingDate = hearingDate;

      const actualRows = buildSummaryRows(req as Request, );

      expect(actualRows).to.deep.equal([{
        key: { text: 'Message details' },
        value: { html: 'details' },
        actions: {
          items: [{
            href: '/close-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Message details'
          }]
        }
      }]);
    });

    it('builds correct summary rows with no hearing related and docs', () => {
      req.session.appeal.messageSubject = 'subject';
      req.session.appeal.messageDetails = 'details';
      req.session.appeal.isHearingRelated = 'No';
      req.session.appeal.hearingDate = hearingDate;
      req.session.appeal.messageDocs = [makeFileMock('one'), makeFileMock('two')];

      const actualRows = buildSummaryRows(req as Request);

      expect(actualRows).to.deep.equal([{
        key: { text: 'Message details' },
        value: { html: 'details' },
        actions: {
          items: [{
            href: '/close-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Message details'
          }]
        }
      }, {
        key: { text: 'Supporting documents' },
        value: { html: 'fileone.pdf<br>filetwo.pdf' },
        actions: {
          items: [{
            href: '/close-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Supporting documents'
          }]
        }
      }]);
    });
  });

  describe('postCloseQueryCya', () => {
    it('postMessage with redirects', async () => {
      const postQueryStub = sandbox.stub().resolves();
      await postCloseQueryCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, postQueryStub)(req as Request, res as Response, next);
      expect(postQueryStub).to.have.been.calledOnceWithExactly(
        req,
        {
          messageType: 'Followup',
          parentId: '1234'
        },
        documentManagementService,
        updateAppealService,
        i18n.pages.closeQuery.messageDetailsPrefix
      );

      expect(res.redirect).to.have.been.calledOnceWithExactly(
        '/close-query/confirmation/1234'
      );

      expect(next).not.to.have.been.called;
    });

    it('catches error if thrown', async () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      await postCloseQueryCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, sinon.stub())(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getCloseQueryConfirmation', () => {
    it('renders page correctly and deletes temporary query fields', () => {
      const clock: sinon.SinonFakeTimers = sandbox.useFakeTimers(new Date('2025-06-15'));
      getCloseQueryConfirmation(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'templates/confirmation-page.njk', {
        title: i18n.pages.sendMessageConfirmation.title,
        whatNextListItems: i18n.pages.sendMessageConfirmation.whatNextListItems,
        date: '25 June 2025'
      });

      clock.restore();
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getCloseQueryConfirmation(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('setupCloseQueryController', () => {
    it('should setup the routes', () => {
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupCloseQueryController([], updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub.calledWith(paths.common.closeQuery)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.closeQueryUpload)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.closeQueryDelete)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.closeQuery)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.closeQueryCya)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.closeQueryCya)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.closeQueryConfirmation)).to.equal(true);
    });
  });

});