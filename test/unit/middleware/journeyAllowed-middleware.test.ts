import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  isJourneyAllowedMiddleware,
  isTimeExtensionsInProgress
} from '../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../app/paths';
import { expect, sinon } from '../../utils/testUtils';

describe('isJourneyAllowedMiddleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<session.Session>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {}
      } as any
    } as Partial<Request>;
    redirectStub = sinon.stub();
    res = {
      render: sandbox.stub(),
      redirect: redirectStub,
      clearCookie: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should allow access to page', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    const reqWithPath = { ...req, path: paths.appealStarted.name } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should allow access to page with params', () => {
    req.params.id = '3';
    req.session.appeal.appealStatus = 'awaitingClarifyingQuestionsAnswers';
    const reqWithPath = {
      ...req,
      path: paths.awaitingClarifyingQuestionsAnswers.question.replace(':id', '3')
    } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should allow access to page with params', () => {
    req.session.appeal.appealStatus = 'decided';
    const reqWithPath = { ...req, path: paths.ftpa.ftpaApplication } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should render forbidden page when page not available for that state', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    const reqWithPath = { ...req, path: paths.appealSubmitted.confirmation } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(redirectStub.calledWith(paths.common.forbidden)).to.equal(true);
  });

  it('should allow access to document viewer', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    const reqWithPath = { ...req, path: paths.common.documentViewer + 'someFileName' } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
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
    expect(redirectStub.calledWith(paths.common.forbidden)).to.equal(true);
  });

  it('should allow access to page if inFlight is not defined', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.askForMoreTime = {};
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should allow access to page if no time extension in progress', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.askForMoreTime = { inFlight: false };
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(next.called).to.equal(true);
  });
});
