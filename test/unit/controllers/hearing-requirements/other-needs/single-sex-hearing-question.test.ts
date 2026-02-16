import express, { NextFunction, Request, Response } from 'express';
import {
  getSingleSexHearingQuestion,
  postSingleSexHearingQuestion,
  setupHearingSingleSexAppointmentQuestionController
} from '../../../../../app/controllers/hearing-requirements/other-needs/single-sex-hearing-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Single sex appointment Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          hearingRequirements: {
            otherNeeds: {}
          }
        } as Partial<Appeal>
      },
      idam: {
        userDetails: {
          uid: 'someid'
        }
      },
      cookies: {
        '__auth-token': 'atoken'
      }
    } as Partial<Request>;
    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub,
      send: sandbox.stub()
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingSingleSexAppointmentQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingSingleSexAppointmentQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion)).to.equal(true);
    });
  });

  describe('getSingleSexHearingQuestion', () => {
    it('should render question page', () => {

      getSingleSexHearingQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-single-sex',
        pageTitle: 'Will you need an all-female or all-male hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you need an all-female or all-male hearing?'
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

      getSingleSexHearingQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postSingleSexHearingQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postSingleSexHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if you need an all-female or all-male hearing'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-single-sex',
        pageTitle: 'Will you need an all-female or all-male hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you need an all-female or all-male hearing?'
        },
        saveAndContinue: true
      };
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postSingleSexHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsSingleSexTypeHearing)).to.equal(true);
      expect(req.session.appeal.hearingRequirements.otherNeeds.singleSexAppointment).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postSingleSexHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion)).to.equal(true);
      expect(req.session.appeal.hearingRequirements.otherNeeds.singleSexAppointment).to.equal(false);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postSingleSexHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
