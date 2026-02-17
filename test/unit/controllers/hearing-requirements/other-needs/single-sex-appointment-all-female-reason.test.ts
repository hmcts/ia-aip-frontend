import express, { NextFunction, Request, Response } from 'express';
import {
  getSingleSexHearingAllFemaleReason,
  postSingleSexHearingAllFemaleReason, setupSingleSexHearingAllFemaleReasonController
} from '../../../../../app/controllers/hearing-requirements/other-needs/single-sex-hearing-all-female-reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Single sex all female Reason controller', () => {
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

  describe('setupSingleSexHearingAllFemaleReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupSingleSexHearingAllFemaleReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.otherNeedsAllFemaleHearing)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.otherNeedsAllFemaleHearing)).to.equal(true);
    });
  });

  describe('getSingleSexHearingAllFemaleReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/hearing-single-sex-type-female',
        pageTitle: 'Tell us why you need an all-female hearing',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us why you need an all-female hearing',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getSingleSexHearingAllFemaleReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.hearingRequirements.otherNeeds.singleSexAppointmentReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/hearing-single-sex-type-female',
        pageTitle: 'Tell us why you need an all-female hearing',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us why you need an all-female hearing',
          value: 'previously saved answer'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getSingleSexHearingAllFemaleReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getSingleSexHearingAllFemaleReason(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postSingleSexHearingAllFemaleReason', () => {
    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.saveForLater = 'saveForLater';
      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should fail validation and render template with errors', async () => {
      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter the reasons you need an all-female hearing'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-single-sex-type-female',
        pageTitle: 'Tell us why you need an all-female hearing',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us why you need an all-female hearing',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
