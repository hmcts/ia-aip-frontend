import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  checkSession,
  initSession,
  logSession,
  startRepresentingYourself
} from '../../../app/middleware/session-middleware';
import { paths } from '../../../app/paths';
import CcdSystemService from '../../../app/service/ccd-system-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('session-middleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let clearCookieStub: sinon.SinonStub;
  let redirectSpy: sinon.SinonSpy;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clearCookieStub = sandbox.stub();
    redirectSpy = sandbox.spy();
    req = {
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
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: redirectSpy,
      clearCookie: clearCookieStub,
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('logSession', () => {
    const loggerRequestStub = sandbox.stub(logger, 'request');
    logSession(req as Request, res as Response, next);

    expect(loggerRequestStub.called).to.equal(true);
    expect(next.called).to.equal(true);
  });

  it('initSession', async () => {
    const loadAppealStub = sandbox.stub(UpdateAppealService.prototype, 'loadAppeal');
    await initSession(req as Request, res as Response, next);

    expect(loadAppealStub.callCount).to.equal(1);
    expect(next.callCount).to.equal(1);
  });

  it('checkSession has auth token and application', () => {
    req.cookies['__auth-token'] = 'authTokenValue';
    checkSession({})(req as Request, res as Response, next);

    expect(next.callCount).to.equal(1);
  });

  it('checkSession has auth token and no application', () => {
    req.cookies['__auth-token'] = 'authTokenValue';
    req.session.appeal = {} as any;
    checkSession({})(req as Request, res as Response, next);

    expect(redirectSpy.calledWith(paths.common.login)).to.equal(true);
    expect(clearCookieStub.called).to.equal(true);
  });

  it('checkSession has no auth token', () => {
    req.session.appeal = {} as any;
    checkSession({})(req as Request, res as Response, next);

    expect(next.callCount).to.equal(1);
  });

  it('startRepresentingYourself calls next if no start-representing-yourself flow in progress', async () => {
    req.session = {} as any;
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(next.callCount).to.equal(1);
  });

  it('startRepresentingYourself redirects to start if start-representing-yourself flow in incomplete', async () => {
    req.session.startRepresentingYourself = { id: '1234123412341234' } as any;
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(redirectSpy.calledWith(paths.startRepresentingYourself.start)).to.equal(true);
  });

  it('startRepresentingYourself redirects to confirmDetails if not confirmed', async () => {
    req.session.startRepresentingYourself = {
      id: '1234123412341234',
      accessValidated: true
    } as any;
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(redirectSpy.calledWith(paths.startRepresentingYourself.confirmDetails)).to.equal(true);
  });

  it('startRepresentingYourself call next with error if givenAppellantAccess fails', async () => {
    const error = new Error('the error');
    req.session.startRepresentingYourself = {
      id: '1234123412341234',
      accessValidated: true,
      detailsConfirmed: true
    } as any;
    const givenAppellantAccessStub = sandbox.stub(CcdSystemService.prototype, 'givenAppellantAccess').throws(error);
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(givenAppellantAccessStub.callCount).to.equal(1);
    expect(next.calledWith(error)).to.equal(true);
  });

  it('startRepresentingYourself loads case', async () => {
    const appeal = {
      details: 'testing'
    } as Partial<Appeal>;
    req.session.startRepresentingYourself = {
      id: '1234123412341234',
      accessValidated: true,
      detailsConfirmed: true
    } as any;
    const givenAppellantAccessStub = sandbox.stub(CcdSystemService.prototype, 'givenAppellantAccess');
    const submitSimpleEventStub = sandbox.stub(UpdateAppealService.prototype, 'submitSimpleEvent').resolves(appeal as Appeal);
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(givenAppellantAccessStub.callCount).to.equal(1);
    expect(submitSimpleEventStub.callCount).to.equal(1);
    expect(next).to.have.been.callCount(0);
    expect(req.session.startRepresentingYourself).to.equal(undefined);
    expect(req.session.ccdCaseId).to.deep.equal('1234123412341234');
    expect(req.session.appeal).to.equal(appeal);
    expect(redirectSpy.calledWith(paths.common.overview)).to.equal(true);
  });
});
