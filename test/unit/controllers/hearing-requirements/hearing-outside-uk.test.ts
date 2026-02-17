import express, { NextFunction, Request, Response } from 'express';
import {
  getWitnessesOutsideUkQuestion, postWitnessesOutsideUkQuestion,
  setupWitnessesOutsideUkQuestionController
} from '../../../../app/controllers/hearing-requirements/hearing-outside-uk';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing Requirements - Witness Needs - Witnesses outside UK question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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
          hearingRequirements: {
            witnessesOutsideUK: {}
          }
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupWitnessesOutsideUkQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupWitnessesOutsideUkQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.witnessOutsideUK)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.witnessOutsideUK)).to.equal(true);
    });
  });

  describe('getWitnessesOutsideUkQuestion', () => {
    it('should render question page', () => {

      getWitnessesOutsideUkQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-outside-uk',
        pageTitle: 'Will you or any witnesses take part in the hearing from outside the UK?',
        previousPage: previousPage,
        question: {
          name: 'answer',
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses take part in the hearing from outside the UK?',
          hint: 'If you answer yes, a Tribunal Caseworker will contact you to ask for more information about where you or any witnesses will be for the hearing.'
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

      getWitnessesOutsideUkQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postWitnessesOutsideUkQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postWitnessesOutsideUkQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select Yes if you or any witnesses will take part in the hearing from outside the UK'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-outside-uk',
        pageTitle: 'Will you or any witnesses take part in the hearing from outside the UK?',
        previousPage: previousPage,
        question: {
          name: 'answer',
          options: [{ checked: false, text: 'Yes', value: 'yes' }, {
            checked: false,
            text: 'No',
            value: 'no'
          }],
          title: 'Will you or any witnesses take part in the hearing from outside the UK?',
          hint: 'If you answer yes, a Tribunal Caseworker will contact you to ask for more information about where you or any witnesses will be for the hearing.'
        },
        saveAndContinue: true
      };
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to task list page if answer yes', async () => {
      req.body['answer'] = 'yes';
      await postWitnessesOutsideUkQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.submitHearingRequirements.taskList)).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postWitnessesOutsideUkQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.submitHearingRequirements.taskList)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postWitnessesOutsideUkQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
