import { NextFunction, Request, Response } from 'express';
import { filterRequest } from '../../../app/middleware/xss-middleware';
import { expect, sinon } from '../../utils/testUtils';

describe('session-middleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Request;
  let res: Response;
  let next: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { body: {} } as Request;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('does not change field without xss', () => {
    req = {
      body: {
        test: 'test'
      }
    } as Request;
    filterRequest(req, res, next);

    expect(req.body.test).to.deep.equal('test');
    expect(next.called).to.equal(true);
  });

  it('removes html tags', () => {
    req = {
      body: {
        test: '<script>alert(\'test\')</script>test'
      }
    } as Request;
    filterRequest(req, res, next);

    expect(req.body.test).to.deep.equal('test');
    expect(next.called).to.equal(true);
  });

  it('handles multiple fields', () => {
    req = {
      body: {
        test: 'test 1',
        test2: 'test 2'
      }
    } as Request;
    filterRequest(req, res, next);

    expect(req.body.test).to.deep.equal('test 1');
    expect(req.body.test2).to.deep.equal('test 2');
    expect(next.called).to.equal(true);
  });

  it('trims form field', () => {
    req = {
      body: {
        test: '    test\n\t'
      }
    } as Request;
    filterRequest(req, res, next);

    expect(req.body.test).to.deep.equal('test');
    expect(next.called).to.equal(true);
  });
});
