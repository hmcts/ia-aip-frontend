import { Request, Response } from 'express';
import { getIndex } from '../../../app/controllers/index';
import { expect, sinon } from '../config';

describe('Index Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {},
      cookies: {}
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get Index should render index.html', function() {
    getIndex(req as Request, res as Response);
    expect(res.render).to.have.been.calledOnce.calledWith('index.html');
  });
});
