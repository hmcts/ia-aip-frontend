import { Request, Response } from 'express';
import {
  deleteEvidence,
  getAppellantFullName,
  getNameFromId,
  getMessagePath,
  postMessage,
  setMessageDetailsFromBody,
  uploadEvidence
} from '../../../../app/controllers/query-management/common-message-functions';
import { Events } from '../../../../app/data/events';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { createQueryMock, expect, makeFileMock, sinon } from '../../../utils/testUtils';

describe('Common query functions', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

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

  describe('setMessageDetailsFromBody', () => {
    it('always sets details if present in body', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.body['isHearingRelated'] = 'Yes';
      req.body['day'] = '10';
      req.body['month'] = '10';
      req.body['year'] = '2026';
      setMessageDetailsFromBody(req as Request, false);

      expect(req.session.appeal.messageDetails).to.equal('someDetails');
      expect(req.session.appeal.messageSubject).to.be.undefined;
      expect(req.session.appeal.isHearingRelated).to.be.undefined;
      expect(req.session.appeal.hearingDate).to.be.undefined;
    });

    it('sets other fields if true', () => {
      req.body[i18n.pages.sendMessage.subjectId] = 'someSubject';
      req.body[i18n.pages.sendMessage.messageId] = 'someDetails';
      req.body['isHearingRelated'] = 'Yes';
      req.body['day'] = '10';
      req.body['month'] = '10';
      req.body['year'] = '2026';

      setMessageDetailsFromBody(req as Request, true);

      expect(req.session.appeal.messageSubject).to.equal('someSubject');
      expect(req.session.appeal.messageDetails).to.equal('someDetails');
      expect(req.session.appeal.isHearingRelated).to.equal('Yes');
      expect(req.session.appeal.hearingDate).to.deep.equal({ day: '10', month: '10', year: '2026' });
    });

    it('sets hearing fields undefined if missing', () => {
      setMessageDetailsFromBody(req as Request, true);

      expect(req.session.appeal.messageSubject).to.be.undefined;
      expect(req.session.appeal.messageDetails).to.be.undefined;
      expect(req.session.appeal.isHearingRelated).to.be.undefined;
      expect(req.session.appeal.hearingDate).to.deep.equal({ day: undefined, month: undefined, year: undefined });
    });
  });

  describe('getMessagePath', () => {
    it('replaces :id with id', () => {
      expect(getMessagePath('test/:id', 'someId')).to.equal('test/someId');
      expect(getMessagePath('test/:somethingElseid', 'someId')).to.equal('test/:somethingElseid');
    });

    it('returns base path if no id given', () => {
      expect(getMessagePath('test/:id', undefined)).to.equal('test/:id');
      expect(getMessagePath('anything', undefined)).to.equal('anything');
    });
  });

  describe('uploadEvidence', () => {
    it('redirects to noFileSelected if no file found', () => {
      uploadEvidence('/send-message')(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/send-message?errorCode=noFileSelected');
    });

    it('redirects to multerErrorCode if res.locals.errorCode', () => {
      res.locals = { errorCode: 'someRandomErrorCode' };

      uploadEvidence('/send-message')(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/send-message?errorCode=someRandomErrorCode');
    });

    it('redirects to correct path if file appended successfully with existing messageDocs', () => {
      const fileOne: MulterFile = makeFileMock('One');
      const fileTwo: MulterFile = makeFileMock('Two');
      req.session.appeal.messageDocs = [fileOne];
      req.file = fileTwo;
      uploadEvidence('/send-message')(req as Request, res as Response, next);

      fileTwo.id = 2;
      expect(redirectStub).to.be.calledOnceWith('/send-message');
      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);
    });

    it('redirects to correct path if file appended successfully with no messageDocs', () => {
      const fileOne: MulterFile = makeFileMock('One');
      req.file = fileOne;
      uploadEvidence('/send-message')(req as Request, res as Response, next);

      fileOne.id = 1;
      expect(redirectStub).to.be.calledOnceWith('/send-message');
      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne]);
    });

    it('redirects to noFileSelected if no file found for followUp message', () => {
      req.params = { 'id': 'someId' };
      uploadEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId?errorCode=noFileSelected');
    });

    it('redirects to multerErrorCode if res.locals.errorCode for followUp message', () => {
      req.params = { 'id': 'someId' };
      res.locals = { errorCode: 'someRandomErrorCode' };

      uploadEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId?errorCode=someRandomErrorCode');
    });

    it('redirects to correct path if file appended successfully with existing messageDocs for followUp message', () => {
      req.params = { 'id': 'someId' };
      const fileOne: MulterFile = makeFileMock('One');
      const fileTwo: MulterFile = makeFileMock('Two');
      req.session.appeal.messageDocs = [fileOne];
      req.file = fileTwo;
      uploadEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      fileTwo.id = 2;
      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId');
      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);
    });

    it('redirects to correct path if file appended successfully with no messageDocs for followUp message', () => {
      req.params = { 'id': 'someId' };
      const fileOne: MulterFile = makeFileMock('One');
      req.file = fileOne;
      uploadEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      fileOne.id = 1;
      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId');
      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne]);
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      uploadEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('deleteEvidence', () => {
    it('redirects to noFileExists if no query id', () => {
      deleteEvidence('/send-message')(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/send-message?errorCode=noFileExists');
    });

    it('filters out given id and redirects if found id in messageDocs', () => {
      const fileOne: MulterFile = makeFileMock('One');
      const fileTwo: MulterFile = makeFileMock('Two');

      req.query = { 'id': fileOne.id };
      req.session.appeal.messageDocs = [fileOne, fileTwo];

      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);
      deleteEvidence('/send-message')(req as Request, res as Response, next);

      expect(req.session.appeal.messageDocs).to.not.deep.contain(fileOne);
      expect(req.session.appeal.messageDocs).to.not.deep.contain(fileTwo);

      fileTwo.id = 1;
      expect(req.session.appeal.messageDocs).to.deep.contain(fileTwo);
      expect(req.session.appeal.messageDocs).to.deep.equal([fileTwo]);

      expect(redirectStub).to.be.calledOnceWith('/send-message');
    });

    it('does not filter out given id but still redirects if no found id in messageDocs', () => {
      const fileOne: MulterFile = makeFileMock('One');
      const fileTwo: MulterFile = makeFileMock('Two');

      req.query = { 'id': 'randomId' };
      req.session.appeal.messageDocs = [fileOne, fileTwo];

      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);
      deleteEvidence('/send-message')(req as Request, res as Response, next);

      expect(req.session.appeal.messageDocs).to.not.deep.equal([fileOne, fileTwo]);

      fileOne.id = 1;
      fileTwo.id = 2;
      expect(req.session.appeal.messageDocs).to.deep.contain(fileTwo);
      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);

      expect(redirectStub).to.be.calledOnceWith('/send-message');
    });

    it('redirects to noFileExists if no query id for followUp', () => {
      req.params = { id: 'someId' };
      deleteEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId?errorCode=noFileExists');
    });

    it('filters out given id and redirects if found id in messageDocs for followUp', () => {
      const fileOne: MulterFile = makeFileMock('One');
      const fileTwo: MulterFile = makeFileMock('Two');

      req.params = { id: 'someId' };
      req.query = { 'id': fileOne.id };
      req.session.appeal.messageDocs = [fileOne, fileTwo];

      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);
      deleteEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      expect(req.session.appeal.messageDocs).to.not.deep.contain(fileOne);
      expect(req.session.appeal.messageDocs).to.not.deep.contain(fileTwo);

      fileTwo.id = 1;
      expect(req.session.appeal.messageDocs).to.deep.contain(fileTwo);
      expect(req.session.appeal.messageDocs).to.deep.equal([fileTwo]);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId');
    });

    it('does not filter out given id but still redirects if no found id in messageDocs for followUp', () => {
      const fileOne: MulterFile = makeFileMock('One');
      const fileTwo: MulterFile = makeFileMock('Two');

      req.params = { id: 'someId' };
      req.query = { 'id': 'randomId' };
      req.session.appeal.messageDocs = [fileOne, fileTwo];

      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);
      deleteEvidence('/follow-up-message/:id')(req as Request, res as Response, next);

      expect(req.session.appeal.messageDocs).to.not.deep.equal([fileOne, fileTwo]);

      fileOne.id = 1;
      fileTwo.id = 2;
      expect(req.session.appeal.messageDocs).to.deep.contain(fileTwo);
      expect(req.session.appeal.messageDocs).to.deep.equal([fileOne, fileTwo]);

      expect(redirectStub).to.be.calledOnceWith('/follow-up-message/someId');
    });

    it('catches error if thrown', () => {
      const error = new Error('the error');
      redirectStub.throws(error);

      deleteEvidence('/send-message')(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getAppellantFullName', () => {
    it('returns correctly if all present', () => {
      req.session.appeal.application = {
        personalDetails: {
          givenNames: 'someGivenName',
          familyName: 'someFamilyName'
        }
      } as AppealApplication;

      expect(getAppellantFullName(req as Request)).to.equal('someGivenName someFamilyName');
    });

    it('returns correctly if given name not present', () => {
      req.session.appeal.application = { personalDetails: { familyName: 'someFamilyName' } } as AppealApplication;

      expect(getAppellantFullName(req as Request)).to.equal(' someFamilyName');
    });

    it('returns correctly if family name not present', () => {
      req.session.appeal.application = { personalDetails: { givenNames: 'someGivenName' } } as AppealApplication;

      expect(getAppellantFullName(req as Request)).to.equal('someGivenName ');
    });

    it('returns correctly if neither name not present', () => {
      req.session.appeal.application = { personalDetails: {} } as AppealApplication;

      expect(getAppellantFullName(req as Request)).to.equal(' ');
    });
  });

  describe('postMessage', () => {
    let uploadStub: sinon.SinonStub;
    let submitStub: sinon.SinonStub;
    beforeEach(() => {
      submitStub = sandbox.stub();
      uploadStub = sandbox.stub();
      documentManagementService = {
        uploadFiles: uploadStub
      };
      updateAppealService = {
        submitEventRefactored: submitStub
      };
    });

    it('adds specific fields and attachments if given with existing queries on appeal', async () => {
      req.session.appeal.messageDetails = 'someMessageDetails';
      req.session.appeal.messageSubject = 'someMessageSubject';
      req.session.appeal.application = {
        personalDetails: {
          givenNames: 'someGivenName',
          familyName: 'someFamilyName'
        }
      } as AppealApplication;
      req.session.appeal.qmCitizenQueries = {
        roleOnCase: '',
        caseMessages: [
          createQueryMock('Two')
        ]
      };
      const fileOne = makeFileMock('One');
      req.session.appeal.messageDocs = [fileOne];
      uploadStub.resolves([{ fileId: 'someId', name: 'someName' } as Evidence]);
      await postMessage(req as Request, { isHearingRelated: 'No' }, documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService);

      const expectedAppeal: Appeal = {
        messageDetails: 'someMessageDetails',
        messageSubject: 'someMessageSubject',
        application: {
          personalDetails: {
            givenNames: 'someGivenName',
            familyName: 'someFamilyName'
          }
        } as AppealApplication,
        qmCitizenQueries: {
          roleOnCase: '',
          caseMessages: [
            createQueryMock('Two'),
            sinon.match.any
          ]
        },
        messageDocs: [fileOne]
      } as Appeal;
      expect(uploadStub).calledOnceWith(req, [fileOne]);
      expect(submitStub).calledOnceWith(Events.ASK_QUERY, expectedAppeal, 'idamUID', 'atoken');
      expect(req.session.refreshCasesList).to.equal(true);

      expect(req.session.appeal.messageSubject).to.be.undefined;
      expect(req.session.appeal.messageDetails).to.be.undefined;
      expect(req.session.appeal.messageDocs).to.be.undefined;
      expect(req.session.appeal.isHearingRelated).to.be.undefined;

      const newQuery = req.session.appeal.qmCitizenQueries.caseMessages[1];
      expect(newQuery.attachments).to.have.length(1);
      expect(newQuery.body).to.equal('someMessageDetails');
      expect(newQuery.createdBy).to.equal('idamUID');
      expect(newQuery.isClosed).to.be.undefined;
      expect(newQuery.isHearingRelated).to.equal('No');
      expect(newQuery.name).to.equal('someGivenName someFamilyName');
      expect(newQuery.subject).to.be.undefined;
    });

    it('adds other specific fields if given with no existing queries on appeal', async () => {
      req.session.appeal.messageDetails = 'someMessageDetails';
      req.session.appeal.messageSubject = 'someMessageSubject';
      req.session.appeal.application = {
        personalDetails: {
          givenNames: 'someGivenName',
          familyName: 'someFamilyName'
        }
      } as AppealApplication;

      await postMessage(req as Request, { isClosed: 'Yes' }, documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService);
      expect(uploadStub).to.not.be.called;

      const expectedAppeal: Appeal = {
        messageDetails: 'someMessageDetails',
        messageSubject: 'someMessageSubject',
        application: {
          personalDetails: {
            givenNames: 'someGivenName',
            familyName: 'someFamilyName'
          }
        } as AppealApplication,
        qmCitizenQueries: {
          roleOnCase: '',
          caseMessages: [
            sinon.match.any
          ]
        }
      } as Appeal;
      expect(submitStub).calledOnceWith(Events.ASK_QUERY, expectedAppeal, 'idamUID', 'atoken');
      expect(req.session.refreshCasesList).to.equal(true);

      expect(req.session.appeal.messageSubject).to.be.undefined;
      expect(req.session.appeal.messageDetails).to.be.undefined;
      expect(req.session.appeal.messageDocs).to.be.undefined;
      expect(req.session.appeal.isHearingRelated).to.be.undefined;
    });
  });

  describe('getNameFromId', () => {
    const query = { createdBy: undefined };
    it('returns The Tribunal if no query createdBy', () => {
      expect(getNameFromId(query, 'idamId')).to.equal('The Tribunal');
    });

    it('returns The Tribunal if idam id does not match query created by', () => {
      query.createdBy = 'otherId';
      expect(getNameFromId(query, 'idamId')).to.equal('The Tribunal');
    });

    it('returns You if idam id does match query created by', () => {
      query.createdBy = 'idamId';
      expect(getNameFromId(query, 'idamId')).to.equal('You');
    });
  });
});