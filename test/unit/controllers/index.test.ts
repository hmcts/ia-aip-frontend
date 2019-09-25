import { Request, Response } from 'express';
import { getIndex } from '../../../app/controllers/index';
import { expect, sinon } from '../config';

describe('Index Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {},
      cookies: {}
    } as Request;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Response;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get Index should render index.html', function() {
    getIndex(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('index.html');
  });
});
