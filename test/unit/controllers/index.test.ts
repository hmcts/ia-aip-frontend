import { NextFunction, Request, Response } from 'express';
import { getIndex } from '../../../app/controllers';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Index Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {},
      cookies: {},
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = {} as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get Index should render index.njk', function() {
    getIndex(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('index.njk');
  });
});
