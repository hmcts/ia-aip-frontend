import express, { NextFunction, Request, Response } from 'express';
import {
  getJoinHearingByVideoCallQuestion,
  postJoinHearingByVideoCallQuestion,
  setupJoinByVideoCallAppointmentQuestionController
} from '../../../../../app/controllers/hearing-requirements/other-needs/joinby-video-call-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Join By VideoCall Question controller', () => {
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

  describe('setupJoinByVideoCallAppointmentQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupJoinByVideoCallAppointmentQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsVideoAppointment);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsVideoAppointment);
    });
  });

  describe('getJoinHearingByVideoCallQuestion', () => {
    it('should render question page', () => {

      getJoinHearingByVideoCallQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-video-appointment',
        pageTitle: 'Would you be able to join the hearing by video call?',
        previousPage: '/hearing-other-needs',
        question: {
          name: 'answer',
          title: 'Would you be able to join the hearing by video call?',
          hint: '<p>The Tribunal may decide to have the hearing by video call.  Answer no if there are reasons<br>you would not be able to join a video call.</p>',
          options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
        },
        saveAndContinue: true
      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/other-needs/join-hearing-by-videocall.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getJoinHearingByVideoCallQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postJoinHearingByVideoCallQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postJoinHearingByVideoCallQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          key: 'answer',
          text: 'Select Yes if you would be able to join the hearing by video call',
          href: '#answer'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        previousPage: '/hearing-other-needs',
        pageTitle: 'Would you be able to join the hearing by video call?',
        formAction: '/hearing-video-appointment',
        question: {
          name: 'answer',
          title: 'Would you be able to join the hearing by video call?',
          hint: '<p>The Tribunal may decide to have the hearing by video call.  Answer no if there are reasons<br>you would not be able to join a video call.</p>',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true

      };
      expect(res.render).to.have.been.calledWith('hearing-requirements/other-needs/join-hearing-by-videocall.njk', expectedArgs);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postJoinHearingByVideoCallQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion);
      expect(req.session.appeal.hearingRequirements.otherNeeds.remoteVideoCall).to.be.true;
      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
    });

    it('should validate if appellant answers no and redirect to next page', async () => {
      req.body['answer'] = 'no';
      await postJoinHearingByVideoCallQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion);
      expect(req.session.appeal.hearingRequirements.otherNeeds.remoteVideoCall).to.be.false;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postJoinHearingByVideoCallQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
