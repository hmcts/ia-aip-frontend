import express, { NextFunction, Request, Response } from 'express';
import {
  getPrivateHearingQuestion,
  postPrivateHearingQuestion,
  setupPrivateHearingQuestionController
} from '../../../../../app/controllers/hearing-requirements/other-needs/private-hearing-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Private Hearing Question controller', () => {
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
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub,
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPrivateHearingQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupPrivateHearingQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion)).to.equal(true);
    });
  });

  describe('getPrivateHearingQuestion', () => {
    it('should render question page', () => {

      getPrivateHearingQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-private',
        pageTitle: 'Will you need a private hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you need a private hearing?',
          hint: 'A private hearing means the public will not be allowed to attend.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
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

      getPrivateHearingQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postPrivateHearingQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if you need a private hearing'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-private',
        pageTitle: 'Will you need a private hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you need a private hearing?',
          hint: 'A private hearing means the public will not be allowed to attend.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true
      };

      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to next page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingReason)).to.equal(true);
      expect(req.session.appeal.hearingRequirements.otherNeeds.privateAppointment).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to next page', async () => {
      req.body['answer'] = 'no';
      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsHealthConditions)).to.equal(true);
      expect(req.session.appeal.hearingRequirements.otherNeeds.privateAppointment).to.equal(false);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
