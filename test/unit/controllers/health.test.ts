import { Request, Response } from 'express';
import { health, liveness } from '../../../app/controllers/health';
import { expect, sinon } from '../../utils/testUtils';

describe('Health Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {} as Partial<Request>;
    jsonStub = sandbox.stub();
    res = {
      json: jsonStub
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get /health should return ok', function() {
    health(req as Request, res as Response);
    expect(jsonStub.calledOnceWith({ status: 'UP' })).to.equal(true);
  });

  it('get /liveness should return blank object', function() {
    liveness(req as Request, res as Response);
    expect(jsonStub.calledOnceWith({ })).to.equal(true);
  });

  it('get /health/readiness should return ok', function() {
    health(req as Request, res as Response);
    expect(jsonStub.calledOnceWith({ status: 'UP' })).to.equal(true);
  });
});
