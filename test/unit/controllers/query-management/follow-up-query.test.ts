import { Request, Response } from 'express';
import { Session } from 'express-session';
import {
  buildSummaryRows,
  getFollowUpConfirmation,
  getFollowUpCya,
  getFollowUpPage,
  getFollowUpPermissionPage,
  postFollowUpCya,
  postFollowUpPage,
  postFollowUpPermissionPage,
  setupFollowUpQueryController
} from '../../../../app/controllers/query-management/follow-up-query';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { buildExpectedError, buildExpectedRequiredError, expect, makeFileMock, sinon } from '../../../utils/testUtils';
const express = require('express');

describe('Follow up query controller', () => {
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

  describe('getFollowUpPermissionPage', () => {
    it('renders page correctly', () => {
      getFollowUpPermissionPage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message-permission.njk', {
        formAction: '/follow-up-query-permission/1234',
        previousPage: '/view-query/1234'
      });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getFollowUpPermissionPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postFollowUpPermissionPage', () => {
    it('renders page with error if validation fails', () => {
      postFollowUpPermissionPage(req as Request, res as Response, next);

      const error = buildExpectedError('statement', i18n.validationErrors.sendMessagePermissionStatement);
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message-permission.njk', {
        formAction: '/follow-up-query-permission/1234',
        previousPage: '/view-query/1234',
        error: { statement: error },
        errorList: [error]
      });

      expect(redirectStub).to.not.be.called;
    });

    it('redirects to sendMessage if validation passes', () => {
      req.body['statement'] = 'Yes';

      postFollowUpPermissionPage(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-query/1234');
      expect(renderStub).to.not.be.called;
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      postFollowUpPermissionPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getFollowUpPage', () => {
    it('getFollowUpPage renders with empty fields and no errors', () => {
      getFollowUpPage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: '/follow-up-query-permission/1234',
          title: i18n.pages.followUpQueryTitle,
          subject: undefined,
          details: undefined,
          evidenceUploadAction: '/follow-up-query/upload/1234',
          evidences: [],
          evidenceCTA: '/follow-up-query/delete/1234',
          shouldAskAboutHearing: false,
          formAction: '/follow-up-query/1234',
          errors: undefined,
          errorList: undefined
        });
    });

    it('getFollowUpPage renders with non-empty fields and errors', () => {
      req.query['errorCode'] = 'someErrorCode';
      req.session.appeal.messageSubject = 'someSubject';
      req.session.appeal.messageDetails = 'someDetails';
      const fileOne = makeFileMock('one');
      const fileTwo = makeFileMock('two');
      req.session.appeal.messageDocs = [fileOne, fileTwo];
      req.session.appeal.hearingDate = { day: '1', month: '2', year: '1999' };
      req.session.appeal.isHearingRelated = 'Yes';

      getFollowUpPage(req as Request, res as Response, next);

      const error = buildExpectedError('file-upload', i18n.validationErrors.fileUpload.noFileSelected);
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: '/follow-up-query-permission/1234',
          title: i18n.pages.followUpQueryTitle,
          subject: 'someSubject',
          details: 'someDetails',
          evidenceUploadAction: '/follow-up-query/upload/1234',
          evidences: [fileOne, fileTwo],
          evidenceCTA: '/follow-up-query/delete/1234',
          shouldAskAboutHearing: false,
          formAction: '/follow-up-query/1234',
          errors: { 'file-upload': error },
          errorList: [error]
        });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getFollowUpPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postFollowUpPage', () => {
    it('postFollowUpPage renders with error if base validation fails with empty fields', () => {
      postFollowUpPage(req as Request, res as Response, next);
      const subjectError = buildExpectedRequiredError('messageSubject');
      const detailsError = buildExpectedRequiredError('messageDetails');
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: '/follow-up-query-permission/1234',
          title: i18n.pages.followUpQueryTitle,
          subject: undefined,
          details: undefined,
          evidenceUploadAction: '/follow-up-query/upload/1234',
          evidences: [],
          evidenceCTA: '/follow-up-query/delete/1234',
          shouldAskAboutHearing: false,
          formAction: '/follow-up-query/1234',
          errors: { messageDetails: detailsError, messageSubject: subjectError },
          errorList: [subjectError, detailsError]
        });
    });

    it('postFollowUpPage redirects to cya if all valid', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.session.appeal.messageDocs = [makeFileMock('')];

      postFollowUpPage(req as Request, res as Response, next);

      expect(renderStub).to.not.be.called;
      expect(redirectStub).to.be.calledOnceWith('/follow-up-query/send-message/confirm/1234');
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      postFollowUpPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getFollowUpCya', () => {
    it('getFollowUpCya redirects back to sendMessage if missing messageDetails from req', () => {
      getFollowUpCya(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-query/1234');
      expect(renderStub).not.to.be.called;
    });

    it('getFollowUpCya redirects back to sendMessage if missing messageSubject from req', () => {
      req.session.appeal.messageDetails = 'something';
      getFollowUpCya(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-query/1234');
      expect(renderStub).not.to.be.called;
    });

    it('getFollowUpCya renders cya with summary rows', () => {
      req.session.appeal.messageDetails = 'something';
      req.session.appeal.messageSubject = 'something';
      req.session.appeal.isHearingRelated = 'No';

      getFollowUpCya(req as Request, res as Response, next);

      expect(redirectStub).not.to.be.called;
      expectRenderedCalledOnceWithArgs(renderStub, 'templates/check-and-send.njk', {
        pageTitle: i18n.pages.checkYourAnswers.title,
        continuePath: '/follow-up-query/send-message/confirm/1234',
        previousPage: '/follow-up-query/1234',
        cancelPath: '/view-query/1234',
        noContactUs: true,
        summaryRows: sinon.match.any
      });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      getFollowUpCya(req as Request, res as Response, next);

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
        key: { text: 'Message subject' },
        value: { html: 'subject' },
        actions: {
          items: [{
            href: '/follow-up-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Message subject'
          }]
        }
      }, {
        key: { text: 'Message details' },
        value: { html: 'details' },
        actions: {
          items: [{
            href: '/follow-up-query/1234',
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
        key: { text: 'Message subject' },
        value: { html: 'subject' },
        actions: {
          items: [{
            href: '/follow-up-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Message subject'
          }]
        }
      }, {
        key: { text: 'Message details' },
        value: { html: 'details' },
        actions: {
          items: [{
            href: '/follow-up-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Message details'
          }]
        }
      }, {
        key: { text: 'Supporting documents' },
        value: { html: 'fileone.pdf<br>filetwo.pdf' },
        actions: {
          items: [{
            href: '/follow-up-query/1234',
            text: 'Change',
            visuallyHiddenText: 'Supporting documents'
          }]
        }
      }]);
    });
  });

  describe('postFollowUpCya', () => {
    it('postMessage with redirects', async () => {
      const postQueryStub = sandbox.stub().resolves();
      await postFollowUpCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, postQueryStub)(req as Request, res as Response, next);
      expect(postQueryStub).to.have.been.calledOnceWithExactly(
        req,
        {
          messageType: 'Followup',
          parentId: '1234'
        },
        documentManagementService,
        updateAppealService
      );

      expect(res.redirect).to.have.been.calledOnceWithExactly(
        '/follow-up-query/confirmation/1234'
      );

      expect(next).not.to.have.been.called;
    });

    it('catches error if thrown', async () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      await postFollowUpCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, sinon.stub())(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getFollowUpConfirmation', () => {
    it('renders page correctly and deletes temporary query fields', () => {
      const clock: sinon.SinonFakeTimers = sandbox.useFakeTimers(new Date('2025-06-15'));
      getFollowUpConfirmation(req as Request, res as Response, next);

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

      getFollowUpConfirmation(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('setupFollowUpQueryController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupFollowUpQueryController([], updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub.calledWith(paths.common.followUpQueryPermission)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.followUpQueryPermission)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.followUpQuery)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.followUpQueryUpload)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.followUpQueryDelete)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.followUpQuery)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.followUpQueryCya)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.followUpQueryCya)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.followUpQueryConfirmation)).to.equal(true);
    });
  });

});