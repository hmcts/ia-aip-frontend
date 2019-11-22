import { NextFunction, Request, Response } from 'express';
import { applicationStatusUpdate, initSession, logSession } from '../../../app/middleware/session-middleware';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import * as taskUtils from '../../../app/utils/tasks-utils';
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
    const appealApplicationStatusStub = sandbox.stub(taskUtils, 'appealApplicationStatus');
    sandbox.stub(UpdateAppealService.prototype, 'loadAppeal');
    await initSession(req as Request, res as Response, next);

    expect(appealApplicationStatusStub).to.have.been.calledOnce;
    expect(next).to.have.been.calledOnce;
  });

  it('applicationStatusUpdate', () => {
    const appealApplicationStatusStub = sandbox.stub(taskUtils, 'appealApplicationStatus');
    applicationStatusUpdate(req as Request, res as Response, next);

    expect(appealApplicationStatusStub).to.have.been.calledOnce;
    expect(next).to.have.been.calledOnce;
  });
});
