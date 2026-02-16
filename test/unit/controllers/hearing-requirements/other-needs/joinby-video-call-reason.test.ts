import express, { NextFunction, Request, Response } from 'express';
import {
  getJoinByVideoCallReason,
  postJoinByVideoCallReason, setupJoinByVideoCallAppointmentReasonController
} from '../../../../../app/controllers/hearing-requirements/other-needs/joinby-video-call-reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Join Hearing by VideoCall Reason controller', () => {
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
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupJoinByVideoCallAppointmentReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupJoinByVideoCallAppointmentReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.otherNeedsVideoAppointmentReason)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.otherNeedsVideoAppointmentReason)).to.equal(true);
    });
  });

  describe('getJoinByVideoCallReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/hearing-video-appointment-reasons',
        pageTitle: 'Tell us the reasons you would not be able to join a video call',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us the reasons you would not be able to join a video call',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getJoinByVideoCallReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.hearingRequirements.otherNeeds.healthConditionsReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/hearing-video-appointment-reasons',
        pageTitle: 'Tell us the reasons you would not be able to join a video call',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us the reasons you would not be able to join a video call',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getJoinByVideoCallReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getJoinByVideoCallReason(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postJoinByVideoCallReason', () => {
    it('should fail validation and render template with errors', async () => {
      await postJoinByVideoCallReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter the reasons you would not be able to join a video call'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-video-appointment-reasons',
        pageTitle: 'Tell us the reasons you would not be able to join a video call',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Tell us the reasons you would not be able to join a video call',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postJoinByVideoCallReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postJoinByVideoCallReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
