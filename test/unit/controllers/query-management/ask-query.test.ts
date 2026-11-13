import { Request, Response } from 'express';
import moment from 'moment';
import {
  buildSummaryRows,
  getAskQueryPage,
  getCommonQueryPage, getSendMessageConfirmation, getSendMessageCya,
  getSendMessagePage,
  getSendMessagePermissionPage,
  postAskQueryPage, postSendMessageCya,
  postSendMessagePage,
  postSendMessagePermissionPage, setupAskQueryController
} from '../../../../app/controllers/query-management/ask-query';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { buildExpectedError, buildExpectedRequiredError, expect, makeFileMock, sinon } from '../../../utils/testUtils';
const express = require('express');

describe('Ask query controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const commonQueryVals: string[] = i18n.pages.askQuery.commonQueries.map(query => query.value);
  const hearingDate: AppealDate = { day: '01', month: '01', year: '1999' };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {} as Partial<Appeal>
      },
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
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

  describe('getAskQueryPage', () => {
    it('renders page correctly and deletes temporary query fields', () => {
      req.session.appeal.messageSubject = 'someValue';
      req.session.appeal.messageDetails = 'someValue';
      req.session.appeal.messageDocs = [makeFileMock('')];
      req.session.appeal.hearingDate = { day: '1', month: '1', year: '1999' };
      req.session.appeal.isHearingRelated = 'Yes';

      getAskQueryPage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/ask-query.njk', {
        previousPage: paths.common.overview,
        commonQueries: i18n.pages.askQuery.commonQueries
      });

      expect(req.session.appeal.messageSubject).to.be.undefined;
      expect(req.session.appeal.messageDetails).to.be.undefined;
      expect(req.session.appeal.messageDocs).to.be.undefined;
      expect(req.session.appeal.hearingDate).to.be.undefined;
      expect(req.session.appeal.isHearingRelated).to.be.undefined;
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getAskQueryPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postAskQueryPage', () => {
    it('renders page with error if validation fails', () => {
      postAskQueryPage(req as Request, res as Response, next);

      const error = buildExpectedError('queries', 'Select a query option');
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/ask-query.njk', {
        previousPage: paths.common.overview,
        commonQueries: i18n.pages.askQuery.commonQueries,
        errors: { queries: error },
        errorList: [error]
      });

      expect(redirectStub).to.not.be.called;
    });

    for (const queryVal of commonQueryVals) {
      it(`redirects to common query page if ${queryVal} chosen`, () => {
        req.body['queries'] = queryVal;

        postAskQueryPage(req as Request, res as Response, next);

        expect(redirectStub).to.be.calledOnceWith(`/ask-a-query/view-answer?queryValue=${queryVal}`);
        expect(renderStub).to.not.be.called;
      });
    }

    it('redirects to permission page if any other value chosen', () => {
      const queryVal: string = 'nonCommonQueryString';
      expect(commonQueryVals).to.not.contain(queryVal);
      req.body['queries'] = queryVal;

      postAskQueryPage(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith(paths.common.sendMessagePermission);
      expect(renderStub).to.not.be.called;
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      postAskQueryPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getCommonQueryPage', () => {
    it('redirects to askQuery page if no value found', () => {
      req.query['queryValue'] = 'someNonCommonQueryVal';

      getCommonQueryPage(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith(paths.common.askQuery);
      expect(renderStub).to.not.be.called;
    });

    for (const queryVal of commonQueryVals) {
      it(`renders common query page with correct obj if ${queryVal} chosen`, () => {
        req.query['queryValue'] = queryVal;

        getCommonQueryPage(req as Request, res as Response, next);

        expect(redirectStub).to.not.be.called;
        expectRenderedCalledOnceWithArgs(renderStub, 'query-management/common-query.njk', {
          previousPage: paths.common.askQuery,
          query: i18n.pages.askQuery.commonQueries.find(query => query.value === queryVal)
        });
      });
    }

    it('catches error if thrown', () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      getCommonQueryPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSendMessagePermissionPage', () => {
    it('renders page correctly', () => {
      getSendMessagePermissionPage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message-permission.njk', {
        previousPage: paths.common.askQuery
      });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getSendMessagePermissionPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postSendMessagePermissionPage', () => {
    it('renders page with error if validation fails', () => {
      postSendMessagePermissionPage(req as Request, res as Response, next);

      const error = buildExpectedError('statement', i18n.validationErrors.sendMessagePermissionStatement);
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message-permission.njk', {
        previousPage: paths.common.askQuery,
        error: { statement: error },
        errorList: [error]
      });

      expect(redirectStub).to.not.be.called;
    });

    it('redirects to sendMessage if validation passes', () => {
      req.body['statement'] = 'Yes';

      postSendMessagePermissionPage(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith(paths.common.sendMessage);
      expect(renderStub).to.not.be.called;
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      postSendMessagePermissionPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSendMessagePage', () => {
    it('getSendMessagePage renders with empty fields and no errors', () => {
      getSendMessagePage(req as Request, res as Response, next);

      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: undefined,
          details: undefined,
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: [],
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          hearingDate: undefined,
          isHearingRelated: undefined,
          formAction: paths.common.sendMessage,
          errors: undefined,
          errorList: undefined
        });
    });

    it('getSendMessagePage renders with non-empty fields and errors', () => {
      req.query['errorCode'] = 'someErrorCode';
      req.session.appeal.messageSubject = 'someSubject';
      req.session.appeal.messageDetails = 'someDetails';
      const fileOne = makeFileMock('one');
      const fileTwo = makeFileMock('two');
      req.session.appeal.messageDocs = [fileOne, fileTwo];
      req.session.appeal.hearingDate = { day: '1', month: '2', year: '1999' };
      req.session.appeal.isHearingRelated = 'Yes';

      getSendMessagePage(req as Request, res as Response, next);

      const error = buildExpectedError('file-upload', i18n.validationErrors.fileUpload.noFileSelected);
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: 'someSubject',
          details: 'someDetails',
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: [fileOne, fileTwo],
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          hearingDate: { day: '1', month: '2', year: '1999' },
          isHearingRelated: 'Yes',
          formAction: paths.common.sendMessage,
          errors: { 'file-upload': error },
          errorList: [error]
        });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      getSendMessagePage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postSendMessagePage', () => {
    it('postSendMessagePage renders with error if base validation fails with empty fields', () => {
      postSendMessagePage(req as Request, res as Response, next);
      const subjectError = buildExpectedRequiredError('messageSubject');
      const detailsError = buildExpectedRequiredError('messageDetails');
      const hearingError = buildExpectedError('isHearingRelated', 'Please select Yes if this query is related to a hearing');
      expectRenderedCalledOnceWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: undefined,
          details: undefined,
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: [],
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          isHearingRelated: undefined,
          hearingDate: { day: undefined, month: undefined, year: undefined },
          hearingErrorMessage: 'Please select Yes if this query is related to a hearing',
          formAction: paths.common.sendMessage,
          errors: { isHearingRelated: hearingError, messageDetails: detailsError, messageSubject: subjectError },
          errorList: [subjectError, detailsError, hearingError]
        });
    });

    it('postSendMessagePage renders with error if hearing related but no hearing date', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.body['isHearingRelated'] = 'Yes';
      req.body['day'] = undefined;
      req.body['month'] = undefined;
      req.body['year'] = undefined;
      const files = [makeFileMock('')];
      req.session.appeal.messageDocs = files;

      const hearingErrorMessage = 'Please enter the date of your hearing';
      postSendMessagePage(req as Request, res as Response, next);
      let hearingError = buildExpectedError('day', hearingErrorMessage);
      expectRenderedCalledWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: 'someSubject',
          details: 'someDetails',
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: files,
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          isHearingRelated: 'Yes',
          hearingDate: { day: undefined, month: undefined, year: undefined },
          hearingErrorMessage: hearingErrorMessage,
          formAction: paths.common.sendMessage,
          errors: { day: hearingError },
          errorList: [hearingError]
        });

      req.body['day'] = '01';
      postSendMessagePage(req as Request, res as Response, next);
      hearingError = buildExpectedError('month', hearingErrorMessage);
      expectRenderedCalledWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: 'someSubject',
          details: 'someDetails',
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: files,
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          isHearingRelated: 'Yes',
          hearingDate: { day: '01', month: undefined, year: undefined },
          hearingErrorMessage: hearingErrorMessage,
          formAction: paths.common.sendMessage,
          errors: { month: hearingError },
          errorList: [hearingError]
        });

      req.body['month'] = '01';
      postSendMessagePage(req as Request, res as Response, next);
      hearingError = buildExpectedError('year', hearingErrorMessage);
      expectRenderedCalledWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: 'someSubject',
          details: 'someDetails',
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: files,
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          isHearingRelated: 'Yes',
          hearingDate: { day: '01', month: '01', year: undefined },
          hearingErrorMessage: hearingErrorMessage,
          formAction: paths.common.sendMessage,
          errors: { year: hearingError },
          errorList: [hearingError]
        });
    });

    it('postSendMessagePage renders with error if hearing related and hearing date in past', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.body['isHearingRelated'] = 'Yes';
      req.body['day'] = '01';
      req.body['month'] = '01';
      req.body['year'] = '2000';
      const files = [makeFileMock('')];
      req.session.appeal.messageDocs = files;

      const hearingErrorMessage = 'Your hearing date must be in the future';
      postSendMessagePage(req as Request, res as Response, next);
      const hearingError = buildExpectedError('date', hearingErrorMessage);
      expectRenderedCalledWithArgs(renderStub, 'query-management/send-message.njk',
        {
          previousPage: paths.common.sendMessagePermission,
          title: i18n.pages.sendMessage.title,
          subject: 'someSubject',
          details: 'someDetails',
          evidenceUploadAction: paths.common.sendMessageUpload,
          evidences: files,
          evidenceCTA: paths.common.sendMessageDelete,
          shouldAskAboutHearing: true,
          isHearingRelated: 'Yes',
          hearingDate: { day: '01', month: '01', year: '2000' },
          hearingErrorMessage: hearingErrorMessage,
          formAction: paths.common.sendMessage,
          errors: { date: hearingError },
          errorList: [hearingError]
        });
    });

    it('postSendMessagePage redirects to cya if all valid', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.body['isHearingRelated'] = 'Yes';
      req.body['day'] = '01';
      req.body['month'] = '01';
      req.body['year'] = moment().add('10', 'years').get('year');
      req.session.appeal.messageDocs = [makeFileMock('')];

      postSendMessagePage(req as Request, res as Response, next);

      expect(renderStub).to.not.be.called;
      expect(redirectStub).to.be.calledOnceWith(paths.common.sendMessageCya);
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      renderStub.throws(error);

      postSendMessagePage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSendMessageCya', () => {
    it('getSendMessageCya redirects back to sendMessage if missing messageDetails from req', () => {
      getSendMessageCya(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith(paths.common.sendMessage);
      expect(renderStub).not.to.be.called;
    });

    it('getSendMessageCya redirects back to sendMessage if missing messageSubject from req', () => {
      req.session.appeal.messageDetails = 'something';
      getSendMessageCya(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith(paths.common.sendMessage);
      expect(renderStub).not.to.be.called;
    });

    it('getSendMessageCya redirects back to sendMessage if missing isHearingRelated from req', () => {
      req.session.appeal.messageDetails = 'something';
      req.session.appeal.messageSubject = 'something';
      getSendMessageCya(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith(paths.common.sendMessage);
      expect(renderStub).not.to.be.called;
    });

    it('getSendMessageCya renders cya with summary rows', () => {
      req.session.appeal.messageDetails = 'something';
      req.session.appeal.messageSubject = 'something';
      req.session.appeal.isHearingRelated = 'No';

      getSendMessageCya(req as Request, res as Response, next);

      expect(redirectStub).not.to.be.called;
      expectRenderedCalledOnceWithArgs(renderStub, 'templates/check-and-send.njk', {
        pageTitle: i18n.pages.checkYourAnswers.title,
        continuePath: paths.common.sendMessageCya,
        previousPage: paths.common.sendMessage,
        cancelPath: paths.common.overview,
        summaryRows: sinon.match.any
      });
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      getSendMessageCya(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('buildSummaryRows', () => {
    it('builds correct summary rows with  hearing related and no docs', () => {
      req.session.appeal.messageSubject = 'subject';
      req.session.appeal.messageDetails = 'details';
      req.session.appeal.isHearingRelated = 'Yes';
      req.session.appeal.hearingDate = hearingDate;

      const actualRows = buildSummaryRows(req as Request);

      expect(actualRows).to.deep.equal([{
        key: { text: 'Message subject' },
        value: { html: 'subject' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Message subject'
          }]
        }
      }, {
        key: { text: 'Message details' },
        value: { html: 'details' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Message details'
          }]
        }
      }, {
        key: { text: 'Is this query related to a hearing?' },
        value: { html: 'Yes' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Is this query related to a hearing?'
          }]
        }
      }, {
        key: { text: 'Date of hearing' },
        value: { html: '01 January 1999' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Date of hearing'
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
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Message subject'
          }]
        }
      }, {
        key: { text: 'Message details' },
        value: { html: 'details' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Message details'
          }]
        }
      }, {
        key: { text: 'Is this query related to a hearing?' },
        value: { html: 'No' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Is this query related to a hearing?'
          }]
        }
      }, {
        key: { text: 'Supporting documents' },
        value: { html: 'fileone.pdf<br>filetwo.pdf' },
        actions: {
          items: [{
            href: '/ask-a-query/send-message',
            text: 'Change',
            visuallyHiddenText: 'Supporting documents'
          }]
        }
      }]);
    });
  });

  describe('postSendMessageCya', () => {
    it('postMessage with hearingRelated and redirects', async () => {
      const postQueryStub = sandbox.stub().resolves();
      req.session.appeal.isHearingRelated = 'Yes';
      req.session.appeal.hearingDate = hearingDate;
      await postSendMessageCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, postQueryStub)(req as Request, res as Response, next);
      expect(postQueryStub).to.have.been.calledOnceWithExactly(
        req,
        {
          messageType: 'NewQuery',
          isHearingRelated: 'Yes',
          hearingDate: '1999-01-01'
        },
        documentManagementService,
        updateAppealService
      );

      expect(res.redirect).to.have.been.calledOnceWithExactly(
        paths.common.sendMessageConfirmation
      );

      expect(next).not.to.have.been.called;
    });

    it('postMessage with no hearingRelated and redirects', async () => {
      const postQueryStub = sandbox.stub().resolves();
      req.session.appeal.isHearingRelated = 'No';
      req.session.appeal.hearingDate = hearingDate;
      await postSendMessageCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, postQueryStub)(req as Request, res as Response, next);
      expect(postQueryStub).to.have.been.calledOnceWithExactly(
        req,
        {
          messageType: 'NewQuery',
          isHearingRelated: 'No'
        },
        documentManagementService,
        updateAppealService
      );

      expect(res.redirect).to.have.been.calledOnceWithExactly(
        paths.common.sendMessageConfirmation
      );

      expect(next).not.to.have.been.called;
    });

    it('catches error if thrown', async () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      await postSendMessageCya(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService, sinon.stub())(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getSendMessageConfirmation', () => {
    it('renders page correctly and deletes temporary query fields', () => {
      const clock: sinon.SinonFakeTimers = sandbox.useFakeTimers(new Date('2025-06-15'));
      getSendMessageConfirmation(req as Request, res as Response, next);

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

      getSendMessageConfirmation(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('setupAskQueryController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      
      setupAskQueryController([], updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub.calledWith(paths.common.askQuery)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.askQuery)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.commonQueries)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.sendMessagePermission)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.sendMessagePermission)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.sendMessage)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.sendMessageUpload)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.sendMessageDelete)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.sendMessage)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.sendMessageCya)).to.equal(true);
      expect(routerPostStub.calledWith(paths.common.sendMessageCya)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.sendMessageConfirmation)).to.equal(true);
    });
  });

});