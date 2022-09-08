import { NextFunction, Request, Response } from 'express';
import { isUserAuthenticated } from '../../../app/middleware/is-user-authenticated';
import { expect, sinon } from '../../utils/testUtils';

describe('is-user-authenticated middleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      cookies: {},
      session: {}
    } as Partial<Request>;
    res = {
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return false if user is not authenticated', () => {
    isUserAuthenticated(req as Request, res as Response, next);

    expect(res.locals.authenticated).to.be.false;
  });

  it('should return true if user is not authenticated', () => {
    req.cookies['__auth-token'] = 'aToken';
    isUserAuthenticated(req as Request, res as Response, next);

    expect(res.locals.authenticated).to.be.true;
  });

  it('should set redirect url', () => {
    req.originalUrl = '/ask-judge-review';
    isUserAuthenticated(req as Request, res as Response, next);

    expect(req.session.redirectUrl).to.eql('/ask-judge-review');
  });

  it('should set redirect url', () => {
    isUserAuthenticated(req as Request, res as Response, next);

    expect(req.session.redirectUrl).to.be.undefined;
  });
});
