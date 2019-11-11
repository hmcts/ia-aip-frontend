import { NextFunction, Request, Response } from 'express';
import { initSession, logSession } from '../../../app/middleware/session-middleware';
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
      session: {} as Partial<Express.Session>,
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
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('initSession should initialize when appeal not present in session', () => {
    const loggerTraceStub = sandbox.stub(logger, 'trace');
    initSession(req as Request, res as Response, next);
    expect(loggerTraceStub).to.be.called;
    expect(req.session.appeal).to.be.an('object');
    expect(next).to.be.called;
  });

  it('initSession should just call next when appeal is present in session', () => {
    req.session.appeal = {} as Appeal;
    const loggerTraceStub = sandbox.stub(logger, 'trace');
    initSession(req as Request, res as Response, next);
    expect(loggerTraceStub).not.to.be.called;
    expect(req.session.appeal).to.be.an('object');
    expect(next).to.be.called;
  });

  it('logSession', () => {
    const loggerRequestStub = sandbox.stub(logger, 'request');
    logSession(req as Request, res as Response, next);

    expect(loggerRequestStub).to.have.been.called;
    expect(next).to.be.called;
  });
});
