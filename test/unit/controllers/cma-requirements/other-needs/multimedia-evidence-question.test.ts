import express, { NextFunction, Request, Response } from 'express';
import {
  getMultimediaEvidenceQuestion,
  postMultimediaEvidenceQuestion,
  setupMultimediaEvidenceQuestionController
} from '../../../../../app/controllers/cma-requirements/other-needs/multimedia-evidence-question';
import { paths } from '../../../../../app/paths';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Multimedia Evidence Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          cmaRequirements: {
            otherNeeds: {}
          }
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupMultimediaEvidenceQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupMultimediaEvidenceQuestionController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEvidenceQuestion);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEvidenceQuestion);
    });
  });

  describe('getMultimediaEvidenceQuestion', () => {
    it('should render question page', () => {

      getMultimediaEvidenceQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-multimedia-evidence',
        pageTitle: 'Will you bring any multimedia evidence?',
        previousPage: '/appointment-other-needs',
        question: {
          description: 'For example, video or sound recordings.',
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will you bring any multimedia evidence?'
        }
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getMultimediaEvidenceQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postMultimediaEvidenceQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postMultimediaEvidenceQuestion(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if you will bring any multimedia evidence'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-multimedia-evidence',
        pageTitle: 'Will you bring any multimedia evidence?',
        previousPage: '/appointment-other-needs',
        question: {
          description: 'For example, video or sound recordings.',
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will you bring any multimedia evidence?'
        }
      };

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postMultimediaEvidenceQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion);
      expect(req.session.appeal.cmaRequirements.otherNeeds.multimediaEvidence).to.be.true;
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postMultimediaEvidenceQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment);
      expect(req.session.appeal.cmaRequirements.otherNeeds.multimediaEvidence).to.be.false;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postMultimediaEvidenceQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
