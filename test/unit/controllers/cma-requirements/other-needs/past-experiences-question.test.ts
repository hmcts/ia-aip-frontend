import express, { NextFunction, Request, Response } from 'express';
import { postHealthConditionsQuestion } from '../../../../../app/controllers/cma-requirements/other-needs/health-conditions-question';
import {
  getPastExperiencesQuestion,
  postPastExperiencesQuestion,
  setupPastExperiencesQuestionController
} from '../../../../../app/controllers/cma-requirements/other-needs/past-experiences-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Past Experiences Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

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
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPastExperiencesQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupPastExperiencesQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiences);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiences);
    });
  });

  describe('getPastExperiencesQuestion', () => {
    it('should render question page', () => {

      getPastExperiencesQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-past-experiences',
        pageTitle: 'Have you had any past experiences that may affect you at the appointment?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Have you had any past experiences that may affect you at the appointment?',
          description: 'This might be experience of physical or sexual abuse, trafficking or torture.'
        },
        saveAndContinue: true

      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getPastExperiencesQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHealthConditionsQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if you have had any past experiences that may affect you at the appointment'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-past-experiences',
        pageTitle: 'Have you had any past experiences that may affect you at the appointment?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Have you had any past experiences that may affect you at the appointment?',
          description: 'This might be experience of physical or sexual abuse, trafficking or torture.'
        },
        saveAndContinue: true

      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons);
      expect(req.session.appeal.cmaRequirements.otherNeeds.pastExperiences).to.be.true;
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.otherNeedsAnythingElse);
      expect(req.session.appeal.cmaRequirements.otherNeeds.pastExperiences).to.be.false;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
