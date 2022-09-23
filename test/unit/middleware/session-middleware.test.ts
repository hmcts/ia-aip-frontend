import { NextFunction, Request, Response } from 'express';
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
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
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
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      clearCookie: sandbox.stub(),
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('logSession', () => {
    const loggerRequestStub = sandbox.stub(logger, 'request');
    logSession(req as Request, res as Response, next);

    expect(loggerRequestStub).to.have.been.called;
    expect(next).to.be.called;
  });

  it('initSession', async () => {
    const loadAppealStub = sandbox.stub(UpdateAppealService.prototype, 'loadAppeal');
    await initSession(req as Request, res as Response, next);

    expect(loadAppealStub).to.have.been.calledOnce;
    expect(next).to.have.been.calledOnce;
  });

  it('checkSession has auth token and application', () => {
    req.cookies['__auth-token'] = 'authTokenValue';
    checkSession({})(req as Request, res as Response, next);

    expect(next).to.have.been.calledOnce;
  });

  it('checkSession has auth token and no application', () => {
    req.cookies['__auth-token'] = 'authTokenValue';
    req.session.appeal = {} as any;
    checkSession({})(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledWith(paths.common.login);
    expect(res.clearCookie).to.have.been.called;
  });

  it('checkSession has no auth token', () => {
    req.session.appeal = {} as any;
    checkSession({})(req as Request, res as Response, next);

    expect(next).to.have.been.calledOnce;
  });

  it('startRepresentingYourself calls next if no start-representing-yourself flow in progress', async () => {
    req.session = {} as any;
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(next).to.have.been.calledOnce;
  });

  it('startRepresentingYourself redirects to start if start-representing-yourself flow in incomplete', async () => {
    req.session.startRepresentingYourself = {id: '1234123412341234'} as any;
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.start);
  });

  it('startRepresentingYourself redirects to confirmDetails if not confirmed', async () => {
    req.session.startRepresentingYourself = {
      id: '1234123412341234',
      accessValidated: true
    } as any;
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledWith(paths.startRepresentingYourself.confirmDetails);
  });

  it('startRepresentingYourself call next with error if givenAppellantAccess fails', async () => {
    const error = new Error('the error');;
    req.session.startRepresentingYourself = {
      id: '1234123412341234',
      accessValidated: true,
      detailsConfirmed: true
    } as any;
    const givenAppellantAccessStub = sandbox.stub(CcdSystemService.prototype, 'givenAppellantAccess').throws(error);
    await startRepresentingYourself(req as Request, res as Response, next);

    expect(givenAppellantAccessStub).to.have.been.calledOnce;
    expect(next).to.have.been.calledWith(error);
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

    expect(givenAppellantAccessStub).to.have.been.calledOnce;
    expect(submitSimpleEventStub).to.have.been.calledOnce;
    expect(next).to.have.been.callCount(0);
    expect(req.session.startRepresentingYourself).to.be.undefined;
    expect(req.session.ccdCaseId).to.be.eql('1234123412341234');
    expect(req.session.appeal).to.be.eq(appeal);
    expect(res.redirect).to.have.been.calledWith(paths.common.overview);
  });
});
