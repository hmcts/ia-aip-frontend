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
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

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
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
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
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsAllFemaleHearing);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsAllFemaleHearing);
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
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
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
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getSingleSexHearingAllFemaleReason(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postSingleSexHearingAllFemaleReason', () => {
    it('should redirect to overview page if save for later and not validation required', async () => {
      req.body.saveForLater = 'saveForLater';
      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
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
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postSingleSexHearingAllFemaleReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
