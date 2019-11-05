import { NextFunction, Request, Response } from 'express';
import { initSession } from '../../../app/middleware/initSession';
import { expect, sinon } from '../../utils/testUtils';

describe('InitSession middleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any,
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
      send: sandbox.stub(),
      next: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  it('initSession', () => {
    initSession(req as Request, res as Response, next);
    expect(req.session.appeal).to.be.an('object');
  });
});
