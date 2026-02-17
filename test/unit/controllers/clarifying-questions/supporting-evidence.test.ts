import express, { Request, Response } from 'express';
import {
  getSupportingEvidenceDelete,
  getSupportingEvidenceUploadPage,
  postSupportingEvidenceSubmit,
  postSupportingEvidenceUpload,
  setupClarifyingQuestionsSupportingEvidenceUploadController
} from '../../../../app/controllers/clarifying-questions/supporting-evidence';
import { EvidenceUploadConfig } from '../../../../app/controllers/upload-evidence/upload-evidence-controller';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Question-page controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  let evidenceUploadConfig: Partial<EvidenceUploadConfig>;
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let deleteStub: sinon.SinonStub;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
        answer: 'the answer',
        directionId: 'directionId'
      }
    }
  ];

  const file = {
    originalname: 'file.png',
    mimetype: 'type'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: [],
          draftClarifyingQuestionsAnswers: [...clarifyingQuestions]
        }
      }
    } as Partial<Request>;
    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub
    } as Partial<UpdateAppealService>;
    next = sandbox.stub();
    deleteStub = sandbox.stub();
    documentManagementService = {
      deleteFile: deleteStub
    };
    evidenceUploadConfig = {};
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupClarifyingQuestionsSupportingEvidenceUploadController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupClarifyingQuestionsSupportingEvidenceUploadController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceSubmit)).to.equal(true);
      expect(routerGetStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceDeleteFile)).to.equal(true);
    });
  });

  describe('getSupportingEvidenceUploadPage', () => {
    it('should render', () => {
      req.params.id = '1';
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(renderStub.calledWith('upload-evidence/supporting-evidence-upload-page.njk')).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postSupportingEvidenceUpload', () => {
    it('should render with error if no file present', async () => {
      req.params.id = '1';
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.calledWith('upload-evidence/supporting-evidence-upload-page.njk')).to.equal(true);
    });

    it('should save for later with  file', async () => {
      req.params.id = '1';
      req.file = file as Express.Multer.File;
      const documentUploadResponse: Evidence = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      req.body.saveForLater = 'saveForLater';
      const documentMap: DocumentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      req.session.appeal.documentMap = [{ ...documentMap }];
      const appeal: Appeal = {
        ...req.session.appeal
      };
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should upload file', async () => {
      req.params.id = '1';
      req.file = file as Express.Multer.File;
      const documentUploadResponse: Evidence = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      const documentMap: DocumentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      req.session.appeal.documentMap = [{ ...documentMap }];
      const appeal: Appeal = { ...req.session.appeal };
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id))).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getSupportingEvidenceDelete', () => {
    it('should delete an evidence', async () => {
      const supportingEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: 'fileId', url: 'docStoreURLToFile' };
      req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence = [{ ...supportingEvidence }];
      req.session.appeal.documentMap = [{ ...documentMap }];
      req.params.id = '1';
      req.query.id = 'fileId';
      const appeal: Appeal = { ...req.session.appeal };
      await getSupportingEvidenceDelete(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(deleteStub.calledWith(req, documentMap.id)).to.equal(true);
      expect(submitRefactoredStub.called).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id))).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const supportingEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: 'fileId', url: 'docStoreURLToFile' };
      req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence = [{ ...supportingEvidence }];
      req.session.appeal.documentMap = [{ ...documentMap }];
      req.params.id = '1';
      req.query.id = 'fileId';
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      await getSupportingEvidenceDelete(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postSupportingEvidenceSubmit', () => {
    it('should call redirect', () => {
      postSupportingEvidenceSubmit(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList)).to.equal(true);
    });

    it('should call redirect', () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      postSupportingEvidenceSubmit(req as Request, res as Response, next);
      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
