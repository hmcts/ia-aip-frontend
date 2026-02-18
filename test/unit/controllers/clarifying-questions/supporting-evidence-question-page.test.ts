import express, { NextFunction, Request, Response } from 'express';
import {
  getSupportingEvidenceQuestionPage,
  postSupportingEvidenceQuestionPage,
  setupSupportingEvidenceQuestionController
} from '../../../../app/controllers/clarifying-questions/supporting-evidence-question-page';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { nowIsoDate } from '../../../../app/utils/utils';
import { expect, sinon } from '../../../utils/testUtils';

describe('Question-page controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  let submitStub: sinon.SinonStub;
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
        dateResponded: nowIsoDate(),
        answer: 'the answer',
        directionId: 'directionId'
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues',
        directionId: 'directionId'
      }
    }
  ];

  const clarifyingQuestionsWithEvidence: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
        dateResponded: nowIsoDate(),
        answer: 'the answer',
        directionId: 'directionId',
        supportingEvidence: [
          {
            fileId: 'someUUID',
            name: 'docStoreURLToFile'
          }
        ]
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues',
        directionId: 'directionId'
      }
    }
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
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
          draftClarifyingQuestionsAnswers: [ ...clarifyingQuestions ]
        }
      }
    } as Partial<Request>;
    submitStub = sandbox.stub();
    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub,
      submitEvent: submitStub
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion}`)).to.equal(true);
      expect(routerPostStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceQuestion}`)).to.equal(true);
    });
  });

  describe('getSupportingEvidenceQuestionPage', () => {
    it('should get Evidence Question Page', () => {
      getSupportingEvidenceQuestionPage(req as Request, res as Response, next);

      expect(renderStub.calledWith('upload-evidence/supporting-evidence-question-page.njk')).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getSupportingEvidenceQuestionPage(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postSupportingEvidenceQuestionPage', () => {
    const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
    let appeal: Partial<Appeal>;
    beforeEach(() => {
      appeal = {
        draftClarifyingQuestionsAnswers: [ ...clarifyingQuestionsWithEvidence ],
        documentMap: [ documentMap ]
      };
      appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence = [];
      updateAppealService = { submitEventRefactored: submitRefactoredStub.returns({ appeal }) } as Partial<UpdateAppealService>;
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should fail validation and show errors', async () => {
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(renderStub.calledWith('upload-evidence/supporting-evidence-question-page.njk')).to.equal(true);
    });

    it('should redirect to upload page', async () => {
      req.params.id = '1';
      req.body.answer = 'true';
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(new RegExp(':id'), `${req.params.id}`))).to.equal(true);
    });

    it('should redirect to questions list page if no evidences to upload', async () => {
      req.params.id = '1';
      req.body.answer = 'false';
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList)).to.equal(true);
    });

    it('should delete evidences if there was any and appellant select No to upload evidences', async () => {
      req.session.appeal.documentMap = [ documentMap ];
      req.session.appeal.draftClarifyingQuestionsAnswers = [ ...clarifyingQuestionsWithEvidence ];
      req.params.id = '1';
      req.body.answer = 'false';
      await postSupportingEvidenceQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.draftClarifyingQuestionsAnswers[0].value.supportingEvidence).to.have.lengthOf(0);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList)).to.equal(true);
    });
  });

});
