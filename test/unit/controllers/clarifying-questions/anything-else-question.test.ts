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
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [
    {
      id: 'id1',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your children'
      }
    },
    {
      id: 'id2',
      value: {
        dateSent: '2020-04-23',
        dueDate: '2020-05-07',
        question: 'Tell us more about your health issues'
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
          draftClarifyingQuestionsAnswers: [ ...clarifyingQuestions ],
          documentMap: [{
            id: 'id2',
            url: 'theDocumentUrl'
          }]
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() } as Partial<DocumentManagementService>;
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
      expect(routerGetStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage}`);
      expect(routerPostStub).to.have.been.calledWith(`${paths.awaitingClarifyingQuestionsAnswers.anythingElseQuestionPage}`);
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

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
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
      res.render = sandbox.stub().throws(error);

      getAnythingElseQuestionPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAnythingElseQuestionPage', () => {
    it('should fail validation and render template with errors', async () => {
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk');
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'true';
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage);
    });

    it('should validate and redirect to questions list page', async () => {
      const evidences: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.draftClarifyingQuestionsAnswers[1].value.supportingEvidence = [ ...evidences ];
      req.body['answer'] = 'false';
      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.calledOnce;
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CLARIFYING_QUESTION_ANSWERS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingClarifyingQuestionsAnswers.questionsList);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postAnythingElseQuestionPage(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
