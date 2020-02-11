import { NextFunction, Request, Response } from 'express';
import { appealOutOfTimeMiddleware } from '../../../app/middleware/outOfTime-middleware';
import { expect, sinon } from '../../utils/testUtils';

describe('appealOutOfTime Middleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {} as any,
      body: {}
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.stub() as () => void
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call next if appeal is not late', () => {
    appealOutOfTimeMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce;
  });

  it('should redirect to appeal late page if appeal is late', () => {
    req.session.appeal.application.isAppealLate = true;
    appealOutOfTimeMiddleware(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledOnce;
  });

  it('should call next if appeal is late but a reason has been provided', () => {
    req.session.appeal.application.isAppealLate = true;
    req.session.appeal.application.lateAppeal = {
      reason: 'The reason why I am late'
    };
    appealOutOfTimeMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce;
  });
});
