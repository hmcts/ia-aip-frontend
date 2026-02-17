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
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
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
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();
    submitStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
    updateAppealService = { submitEvent: submitStub } as Partial<UpdateAppealService>;
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
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiences)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiences)).to.equal(true);
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
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getPastExperiencesQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons)).to.equal(true);
      expect(req.session.appeal.cmaRequirements.otherNeeds.pastExperiences).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsAnythingElse)).to.equal(true);
      expect(req.session.appeal.cmaRequirements.otherNeeds.pastExperiences).to.equal(false);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postPastExperiencesQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
