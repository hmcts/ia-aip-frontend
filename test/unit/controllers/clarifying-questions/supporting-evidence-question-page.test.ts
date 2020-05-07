import express, { NextFunction, Request, Response } from 'express';
import {
  getSupportingEvidenceQuestionPage,
  postSupportingEvidenceQuestionPage,
  setupSupportingEvidenceQuestionController
} from '../../../../app/controllers/clarifying-questions/supporting-evidence-question-page';
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
        question: 'Tell us more about your children'
      }
    },
    {
      id: 'id2',
      value: {
        question: 'Tell us more about your health issues'
      }
    }
  ];

  const clarifyingQuestionsWithEvidence: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        question: 'Tell us more about your children',
        answer: 'the answer',
        supportingEvidence: [
          {
            fileId: 'someUUID',
            name: 'docStoreURLToFile'
          }
        ]
      }
    }
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          draftClarifyingQuestionsAnswers: [ ...clarifyingQuestions ]
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupSupportingEvidenceQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupSupportingEvidenceQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion}`);
      expect(routerPostStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion}`);
    });
  });

  describe('getSupportingEvidenceQuestionPage', () => {
    it('should get Evidence Question Page', () => {
      getSupportingEvidenceQuestionPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/supporting-evidence-question-page.njk');
    });

    it('should catch error and call next with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getSupportingEvidenceQuestionPage(req as Request, res as Response, next);

      expect(next).to.have.been.called.calledWith(error);
    });
  });

  describe('postSupportingEvidenceQuestionPage', () => {
    it('should fail validation and show errors', async () => {
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.called.calledWith('upload-evidence/supporting-evidence-question-page.njk');
    });

    it('should redirect to upload page', async () => {
      req.params.id = '1';
      req.body.answer = 'true';
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(`:id`), `${req.params.id}`));
    });

    it('should redirect to questions list page if no evidences to upload', async () => {
      req.params.id = '1';
      req.body.answer = 'false';
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList);
    });

    it('should delete evidences if there was any and appellant select No to upload evidences', async () => {
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];
      req.session.appeal.draftClarifyingQuestionsAnswers = [ ...clarifyingQuestionsWithEvidence ];
      req.params.id = '1';
      req.body.answer = 'false';
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence).to.be.empty;
      expect(res.redirect).to.have.been.called.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList);

    });
  });

});
