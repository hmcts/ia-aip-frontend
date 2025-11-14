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
      res = {
        redirect: sandbox.stub(),
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
        expect(idamFunctionsStub.getIdamLoginUrl).to.have.been.calledWith({ state: '__state__' });
      });
    });

    describe('no auth token', () => {
      it('should call getIdamLoginUrl', () => {
        handler(req, res, next);

        expect(idamFunctionsStub.getIdamLoginUrl).to.have.been.calledOnce;
        expect(res.cookie).to.have.been.calledOnce;
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
          expect(idamFunctionsStub.getUserDetails).to.have.been.calledOnce;
          expect(next).to.have.been.calledOnce;
        });
      });

      it('should set idam userDetails if getUserDetails resolves', () => {
        idamFunctionsStub.getUserDetails.resolves(userDetails);
        handler(req, res, next);
        setImmediate(() => {
          expect(idamFunctionsStub.getUserDetails).to.have.been.calledOnce;
          expect(req.idam.userDetails).to.equal(userDetails);
          expect(next).to.have.been.calledOnce;
        });
      });

      it('should call getIdamLoginUrl and redirect if getUserDetails rejects', () => {
        idamFunctionsStub.getUserDetails.rejects();
        handler(req, res, next);

        setImmediate(() => {
          expect(idamFunctionsStub.getUserDetails).to.have.been.calledOnce;
          expect(idamFunctionsStub.getIdamLoginUrl).to.have.been.calledOnce;
          expect(res.redirect).to.have.been.calledOnce;
          expect(next).to.not.have.been.called;
        });
      });
    });

    describe('state cookie', () => {
      it('should remove state cookie', () => {
        req.cookies[config.stateCookieName] = 'uuid';
        const handler = middleware(idamArgs);
        handler(req, res, next);

        expect(res.clearCookie).to.have.been.calledOnce;
      });
    });
  });
});
