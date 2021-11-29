import express, { NextFunction, Request, Response } from 'express';
import {
  getHearingPastExperiencesReason,
  postHearingPastExperiencesReason, setupHearingPastExperiencesReasonController
} from '../../../../../app/controllers/hearing-requirements/other-needs/past-experiences-reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Past Experiences Reason controller', () => {
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

  describe('setupHearingPastExperiencesReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingPastExperiencesReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsPastExperiencesReasons);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsPastExperiencesReasons);
    });
  });

  describe('getHearingPastExperiencesReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/hearing-past-experiences-reasons',
        pageTitle: 'Tell us how any past experiences may affect you at the hearing',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us how any past experiences may affect you at the hearing',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getHearingPastExperiencesReason(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.hearingRequirements.otherNeeds.pastExperiencesReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/hearing-past-experiences-reasons',
        pageTitle: 'Tell us how any past experiences may affect you at the hearing',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us how any past experiences may affect you at the hearing',
          value: 'previously saved answer'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getHearingPastExperiencesReason(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHearingPastExperiencesReason(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHearingPastExperiencesReason', () => {
    it('should fail validation and render template with errors', async () => {
      await postHearingPastExperiencesReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter details of how any past experiences will affect you at the hearing'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-past-experiences-reasons',
        pageTitle: 'Tell us how any past experiences may affect you at the hearing',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us how any past experiences may affect you at the hearing',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postHearingPastExperiencesReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsAnythingElse);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postHearingPastExperiencesReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
