import express, { NextFunction, Request, Response } from 'express';
import {
  getAnythingElseQuestionPage,
  postAnythingElseQuestionPage,
  setupCQAnythingElseQuestionController
} from '../../../../app/controllers/clarifying-questions/anything-else-question';
import { Events } from '../../../../app/data/events';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Clarifying Questions: Anything else question-page controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonSpy;
  let submit: sinon.SinonStub;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children',
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
  let deleteFile: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    deleteFile = sandbox.stub();
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
          draftClarifyingQuestionsAnswers: [ ...clarifyingQuestions ],
          documentMap: [{
            id: 'id2',
            url: 'theDocumentUrl'
          }]
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();
    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
    submit = sandbox.stub();
    updateAppealService = { submitEventRefactored: submit } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: deleteFile } as Partial<DocumentManagementService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCQAnythingElseQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupCQAnythingElseQuestionController(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage}`)).to.equal(true);
      expect(routerPostStub.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage}`)).to.equal(true);
    });
  });

  describe('getAnythingElseQuestionPage', () => {
    it('should render template page', () => {
      const anythingElseQuestion: ClarifyingQuestion<Evidence> = req.session.appeal.draftClarifyingQuestionsAnswers[1];
      const options = [
        {
          value: true,
          text: 'Yes'
        },
        {
          value: false,
          text: 'No'
        }
      ];
      getAnythingElseQuestionPage(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        {
          previousPage: paths.awaitingClarifyingQuestionsAnswers.questionsList,
          pageTitle: anythingElseQuestion.value.question,
          formAction: paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage,
          question: {
            title: anythingElseQuestion.value.question,
            hint: i18n.pages.clarifyingQuestionAnythingElseQuestion.hint,
            options
          }
        }
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getAnythingElseQuestionPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postAnythingElseQuestionPage', () => {
    it('should fail validation and render template with errors', async () => {
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(renderStub.calledWith('templates/radio-question-page.njk')).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'true';
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage)).to.equal(true);
    });

    it('should validate, delete evidene, and redirect to questions list page', async () => {
      const evidences: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      // req.session.appeal.draftClarifyingQuestionsAnswers[1].value.supportingEvidence = [ ...evidences ];
      const draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
      const anythingElseQuestion: ClarifyingQuestion<Evidence> = draftClarifyingQuestionsAnswers.pop();
      // anythingElseQuestion.value.supportingEvidence = [ ...evidences ];
      const appeal: Appeal = {
        ...req.session.appeal,
        draftClarifyingQuestionsAnswers: [
          ...draftClarifyingQuestionsAnswers,
          anythingElseQuestion
        ]
      };
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub();
      req.body['answer'] = 'false';
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(deleteFile.called).to.equal(false);
      expect(submit.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList)).to.equal(true);
    });

    it('should validate, delete evidence, and redirect to questions list page', async () => {
      const evidences: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.draftClarifyingQuestionsAnswers[1].value.supportingEvidence = [ ...evidences ];
      const draftClarifyingQuestionsAnswers: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
      const anythingElseQuestion: ClarifyingQuestion<Evidence> = draftClarifyingQuestionsAnswers.pop();
      anythingElseQuestion.value.supportingEvidence = [ ...evidences ];
      const appeal: Appeal = {
        ...req.session.appeal,
        draftClarifyingQuestionsAnswers: [
          ...draftClarifyingQuestionsAnswers,
          anythingElseQuestion
        ]
      };
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub();
      req.body['answer'] = 'false';
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(deleteFile.callCount).to.equal(1);
      expect(submit.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
