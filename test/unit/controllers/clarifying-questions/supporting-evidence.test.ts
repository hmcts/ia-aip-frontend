import express, { NextFunction, Request, Response } from 'express';
import {
  getSupportingEvidenceDelete,
  getSupportingEvidenceUploadPage,
  postSupportingEvidenceSubmit,
  postSupportingEvidenceUpload,
  setupClarifyingQuestionsSupportingEvidenceUploadController
} from '../../../../app/controllers/clarifying-questions/supporting-evidence';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Question-page controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        question: 'Tell us more about your children',
        answer: 'the answer'
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
      params: {},
      session: {
        appeal: {
          documentMap: [ ],
          draftClarifyingQuestionsAnswers: [ ...clarifyingQuestions ]
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = {
      submitEvent: sandbox.stub(),
      updateAppealService: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
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
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceSubmit);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceDeleteFile);
    });
  });

  describe('getSupportingEvidenceUploadPage', () => {
    it('should render', () => {
      req.params.id = '1';
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/supporting-evidence-upload-page.njk');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getSupportingEvidenceUploadPage(req as Request, res as Response, next);

      expect(next).to.have.been.called.calledWith(error);
    });
  });

  describe('postSupportingEvidenceUpload', () => {
    it('should render with error if no file present', async () => {
      req.params.id = '1';
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/supporting-evidence-upload-page.njk');
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
      req.session.appeal.documentMap = [ { ...documentMap } ];
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id));
    });

    it('should catch error and call next with error', async () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postSupportingEvidenceUpload(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.called.calledWith(error);
    });
  });

  describe('getSupportingEvidenceDelete', () => {
    it('should delete an evidence', async () => {
      const supportingEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: 'fileId', url: 'docStoreURLToFile' };
      req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence = [ { ...supportingEvidence } ];
      req.session.appeal.documentMap = [ { ...documentMap } ];
      req.params.id = '1';
      req.query.id = 'fileId';
      await getSupportingEvidenceDelete(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.calledWith(req, req.session.appeal.documentMap[0].url);
      expect(updateAppealService.submitEvent).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), req.params.id));
    });

    it('should catch error and call next with error', async () => {
      const supportingEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: 'fileId', url: 'docStoreURLToFile' };
      req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence = [ { ...supportingEvidence } ];
      req.session.appeal.documentMap = [ { ...documentMap } ];
      req.params.id = '1';
      req.query.id = 'fileId';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      await getSupportingEvidenceDelete(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postSupportingEvidenceSubmit', () => {
    it('should call redirect', () => {
      postSupportingEvidenceSubmit(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList);
    });

    it('should call redirect', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      postSupportingEvidenceSubmit(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });
  });
});
