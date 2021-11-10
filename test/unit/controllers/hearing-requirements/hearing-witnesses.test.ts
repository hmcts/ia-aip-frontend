import express, { NextFunction, Request, Response } from 'express';
import {
  getWitnessesOnHearingQuestion, postWitnessesOnHearingQuestion,
  setupWitnessesOnHearingQuestionController
} from '../../../../app/controllers/hearing-requirements/hearing-witnesses';
import { paths } from '../../../../app/paths';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing Requirements - Witness Needs - Witnesses on hearing question controller', () => {
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
          hearingRequirements: {
            witnessesOnHearing: {}
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

  describe('setupWitnessesOnHearingQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupWitnessesOnHearingQuestionController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.witnesses);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.witnesses);
    });
  });

  describe('getWitnessesOnHearingQuestion', () => {
    it('should render question page', () => {

      getWitnessesOnHearingQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-witnesses',
        pageTitle: 'Will any witnesses come to the hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will any witnesses come to the hearing?'
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

      getWitnessesOnHearingQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postWitnessesOnHearingQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postWitnessesOnHearingQuestion()(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if any witnesses will be coming to the hearing'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-witnesses',
        pageTitle: 'Will any witnesses come to the hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will any witnesses come to the hearing?'
        },
        saveAndContinue: true

      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to witness names page if answer yes', async () => {
      req.body['answer'] = 'yes';
      await postWitnessesOnHearingQuestion()(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingWitnessNames);
    });

    it('should validate if appellant answers no and redirect to witness outside UK page', async () => {
      req.body['answer'] = 'no';
      await postWitnessesOnHearingQuestion()(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.witnessOutsideUK);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postWitnessesOnHearingQuestion()(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
