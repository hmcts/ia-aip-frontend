import { NextFunction, Request, Response } from 'express';
import { any } from 'joi';
import {
  isJourneyAllowedMiddleware,
  isTimeExtensionsInProgress
} from '../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import { expect, sinon } from '../../utils/testUtils';

describe('isJourneyAllowedMiddleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {}
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sinon.spy(),
      clearCookie: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should allow access to page', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    req.path = paths.appealStarted.name;
    isJourneyAllowedMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should allow access to page with params', () => {
    req.params.id = '3';
    req.session.appeal.appealStatus = 'awaitingClarifyingQuestionsAnswers';
    req.path = paths.awaitingClarifyingQuestionsAnswers.question.replace(':id', '3');
    isJourneyAllowedMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should render forbidden page when page not available for that state', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    req.path = paths.appealSubmitted.confirmation;
    isJourneyAllowedMiddleware(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.called.calledWith(paths.common.forbidden);
  });

  it('should allow access to document viewer', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    req.path = paths.common.documentViewer + 'someFileName';
    isJourneyAllowedMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should render forbidden if time extension in progress', () => {
    req.session.appeal.makeAnApplications = [{
      id: '1',
      value: {
        applicant: 'Appellant',
        applicantRole: 'citizen',
        date: '2021-07-15',
        decision: 'Pending',
        details: 'my details',
        state: 'awaitingReasonsForAppeal',
        type: 'Time extension',
        evidence: []
      }
    }];
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.called.calledWith(paths.common.forbidden);
  });

  it('should allow access to page if inFlight is not defined', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.askForMoreTime = { };
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should allow access to page if no time extension in progress', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.askForMoreTime = { inFlight: false };
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should redirect to overview page if the hearing requirements is disabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-requirements-feature', false).resolves(false);
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    req.path = paths.submitHearingRequirements.taskList;
    await isJourneyAllowedMiddleware(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.called.calledWith(paths.common.overview);
  });

  it('should redirect to taskList page if the hearing requirements is enabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-requirements-feature', false).resolves(true);
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    req.path = paths.submitHearingRequirements.taskList;
    await isJourneyAllowedMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });
});
