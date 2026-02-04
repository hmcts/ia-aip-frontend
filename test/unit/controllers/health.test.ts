import { Request, Response } from 'express';
import { health, liveness } from '../../../app/controllers/health';
import { expect, sinon } from '../../utils/testUtils';

describe('Health Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {} as Partial<Request>;

    res = {
      json: sandbox.stub()
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get /health should return ok', function() {
    health(req as Request, res as Response);
    expect(res.json).to.have.been.calledOnce.calledWith({ status: 'UP' });
  });

  it('get /liveness should return blank object', function() {
    liveness(req as Request, res as Response);
    expect(res.json).to.have.been.calledOnce.calledWith({ });
  });

  it('get /health/readiness should return ok', function() {
    health(req as Request, res as Response);
    expect(res.json).to.have.been.calledOnce.calledWith({ status: 'UP' });
  });
});
