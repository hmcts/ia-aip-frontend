import { NextFunction, Request, Response } from 'express';
import { isUserAuthenticated } from '../../../app/middleware/is-user-authenticated';
import { expect, sinon } from '../../utils/testUtils';

describe('is-user-authenticated middleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      cookies: {},
      session: {}
    } as Partial<Request>;
    res = {
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return false if user is not authenticated', () => {
    isUserAuthenticated(req as Request, res as Response, next);

    expect(res.locals.authenticated).to.equal(false);
  });

  it('should return true if user is not authenticated', () => {
    req.cookies['__auth-token'] = 'aToken';
    isUserAuthenticated(req as Request, res as Response, next);

    expect(res.locals.authenticated).to.equal(true);
  });

  it('should set redirect url', () => {
    req.originalUrl = '/ask-judge-review';
    isUserAuthenticated(req as Request, res as Response, next);

    expect(req.session.redirectUrl).to.deep.equal('/ask-judge-review');
  });

  it('should set redirect url', () => {
    isUserAuthenticated(req as Request, res as Response, next);

    expect(req.session.redirectUrl).to.equal(undefined);
  });
});
