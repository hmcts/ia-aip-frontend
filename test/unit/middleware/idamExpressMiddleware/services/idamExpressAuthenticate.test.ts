import { SinonStub } from 'sinon';
import config from '../../../../../app/middleware/ia-idam-express-middleware/config';
import middleware
  from '../../../../../app/middleware/ia-idam-express-middleware/services/idamExpressAuthenticate';
import idamWrapper from '../../../../../app/middleware/ia-idam-express-middleware/wrapper';
import { expect, sinon } from '../../../../utils/testUtils';

describe('idamExpressAuthenticate', () => {
  let req;
  let res;
  let next: SinonStub;
  let sandbox: sinon.SinonSandbox;
  const idamArgs = {
    state: () => {
      return '__state__';
    }
  };
  const userDetails = {
    id: 'idam.user.id',
    email: 'email@email.com'
  };
  let redirectStub: sinon.SinonStub;
  it('should return a idamExpressAuthenticate handler', () => {
    const handler = middleware(idamArgs);
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    let handler = null;
    let idamFunctionsStub;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { cookies: {} };
      redirectStub = sandbox.stub();
      res = {
        redirect: redirectStub,
        cookie: sandbox.stub(),
        clearCookie: sandbox.stub()
      };
      next = sandbox.stub();

      idamFunctionsStub = {
        getUserDetails: sandbox.stub(),
        getIdamLoginUrl: sandbox.stub(),
        getIdamApiUrl: sandbox.stub(),
        getServiceAuth: sandbox.stub(),
        getAccessToken: sandbox.stub()
      };
      idamFunctionsStub.getIdamLoginUrl.returns('http://login.url');

      sandbox.stub(idamWrapper, 'setup').returns(idamFunctionsStub);
      handler = middleware(idamArgs);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('with custom state', () => {
      it('should pass the state as redirection', () => {
        handler(req, res, next);
        expect(idamFunctionsStub.getIdamLoginUrl.calledWith({ state: '__state__' })).to.equal(true);
      });
    });

    describe('no auth token', () => {
      it('should call getIdamLoginUrl', () => {
        handler(req, res, next);

        expect(idamFunctionsStub.getIdamLoginUrl.callCount).to.equal(1);
        expect(res.cookie.callCount).to.equal(1);
      });
    });

    describe('with auth token', () => {
      beforeEach(() => {
        req = { cookies: { '__auth-token': 'token' } } as any;
      });

      it('should call next if getUserDetails resolves', () => {
        next = sandbox.stub();
        idamFunctionsStub.getUserDetails.resolves(userDetails);
        handler(req, res, next);

        setImmediate(() => {
          expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
          expect(next.callCount).to.equal(1);
        });
      });

      it('should set idam userDetails if getUserDetails resolves', () => {
        idamFunctionsStub.getUserDetails.resolves(userDetails);
        handler(req, res, next);
        setImmediate(() => {
          expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
          expect(req.idam.userDetails).to.equal(userDetails);
          expect(next.callCount).to.equal(1);
        });
      });

      it('should call getIdamLoginUrl and redirect if getUserDetails rejects', () => {
        idamFunctionsStub.getUserDetails.rejects();
        handler(req, res, next);

        setImmediate(() => {
          expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
          expect(idamFunctionsStub.getIdamLoginUrl.callCount).to.equal(1);
          expect(redirectStub.callCount).to.equal(1);
          expect(next.called).to.equal(false);
        });
      });
    });

    describe('state cookie', () => {
      it('should remove state cookie', () => {
        req.cookies[config.stateCookieName] = 'uuid';
        const handler = middleware(idamArgs);
        handler(req, res, next);

        expect(res.clearCookie.callCount).to.equal(1);
      });
    });
  });
});
