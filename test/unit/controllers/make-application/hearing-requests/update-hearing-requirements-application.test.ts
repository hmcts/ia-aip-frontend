import { NextFunction, Request, Response } from 'express';
import { getUpdateHearingRequirementsApplication, postUpdateHearingRequirementsApplication } from '../../../../../app/controllers/make-application/hearing-requests/update-hearing-requirements-application';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    redirectStub = sandbox.stub();
    res = {
      render: sandbox.stub(),
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getUpdateHearingRequirementsApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      getUpdateHearingRequirementsApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postUpdateHearingRequirementsApplication', () => {
    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postUpdateHearingRequirementsApplication(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});
