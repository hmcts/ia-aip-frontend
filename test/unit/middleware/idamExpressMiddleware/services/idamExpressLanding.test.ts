import { SinonStub } from 'sinon';
import config from '../../../../../app/middleware/ia-idam-express-middleware/config';
import middleware from '../../../../../app/middleware/ia-idam-express-middleware/services/idamExpressLanding';
import idamWrapper from '../../../../../app/middleware/ia-idam-express-middleware/wrapper';
import Logger from '../../../../../app/utils/logger';
import { expect, sinon } from '../../../../utils/testUtils';

describe('idamExpressLanding', () => {
  let req;
  let res;
  let next: SinonStub;
  let sandbox: sinon.SinonSandbox;
  let loggerStub: sinon.SinonStubbedInstance<Logger>;
  const idamArgs = { indexUrl: '/' };
  const userDetails = {
    id: 'idam.user.id',
    email: 'email@email.com'
  };
  const response = { access_token: 'access_token' };

  it('returns a middleware handler', () => {
    const handler = middleware(idamArgs);
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    let handler = null;
    let idamFunctionsStub;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = {
        cookies: {},
        query: []
      };
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
      loggerStub = sandbox.createStubInstance(Logger);
      handler = middleware(idamArgs);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('calls next on successful auth', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'state';

      idamFunctionsStub.getAccessToken.resolves(response);
      idamFunctionsStub.getUserDetails.resolves(userDetails);

      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getAccessToken).to.have.been.calledOnce;
        expect(idamFunctionsStub.getUserDetails).to.have.been.calledOnce;
        expect(res.cookie).to.have.been.calledOnce;
        expect(next).to.have.been.calledOnce;
        expect(loggerStub.exception).to.not.have.been.called;
      });
    });

    it('should set idam userDetails', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'state';

      idamFunctionsStub.getAccessToken.resolves(response);
      idamFunctionsStub.getUserDetails.resolves(userDetails);

      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getAccessToken).to.have.been.calledOnce;
        expect(idamFunctionsStub.getUserDetails).to.have.been.calledOnce;
        expect(res.cookie).to.have.been.calledOnce;
        expect(req.cookies['__auth-token']).to.eql(response.access_token);
        expect(next).to.have.been.calledOnce;
        expect(req.idam.userDetails).to.equal(userDetails);
        expect(loggerStub.exception).to.not.have.been.called;
      });
    });

    it('redirects if error with getAccessToken response', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'state';

      idamFunctionsStub.getAccessToken.rejects();
      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getAccessToken).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledWith('/');
        expect(next).to.not.have.been.called;
        expect(loggerStub.exception).to.have.been.calledOnce;
      });
    });

    context('authToken query', () => {
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.DjwRE2jZhren2Wt37t5hlVru6Myq4AhpGLiiefF69u8';

      beforeEach(() => {
        req.query[config.tokenCookieName] = testToken;
      });

      it('should set the authToken cookie with the query value', () => {
        idamFunctionsStub.getUserDetails.resolves(userDetails);

        handler(req, res, next);

        setImmediate(() => {
          expect(idamFunctionsStub.getUserDetails).to.have.been.calledOnce;
          expect(res.cookie).to.have.been.calledOnce;
          expect(next).to.have.been.calledOnce;
          expect(req.cookies[config.tokenCookieName]).to.equal(testToken);
          expect(loggerStub.exception).to.not.have.been.called;
        });
      });

      it('should do nothing but call next when authToken is invalid', () => {
        req.query[config.tokenCookieName] = 'invalidAuthToken';

        handler(req, res, next);

        expect(res.redirect).to.not.have.been.called;
        expect(next).to.have.been.calledOnce;
        expect(loggerStub.exception).to.not.have.been.called;
      });

      it('should redirect if authToken is unauthorised', () => {
        idamFunctionsStub.getUserDetails.rejects();

        handler(req, res, next);

        setImmediate(() => {
          expect(res.redirect).to.have.been.calledOnce;
          expect(res.redirect.calledWith('/')).to.equal(true);
          expect(next).to.not.have.been.called;
          expect(loggerStub.exception).to.have.been.calledOnce;
        });
      });
    });

    it('redirects if no state exists', () => {
      req.query.code = 'code';
      idamFunctionsStub.getUserDetails.resolves(userDetails);
      idamFunctionsStub.getAccessToken.resolves(response);

      const handler = middleware(idamArgs);
      handler(req, res, next);

      setImmediate(() => {
        expect(res.redirect).to.have.been.calledOnce;
        expect(loggerStub.exception).to.have.been.calledOnce;
      });
    });

    it('redirects if no code exists', () => {
      req.cookies[config.stateCookieName] = 'state';
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.redirect).to.have.been.calledOnce;
      expect(loggerStub.exception).to.not.have.been.called;
    });

    it('removes old state cookie', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'uuid';
      idamFunctionsStub.getUserDetails.resolves(userDetails);
      idamFunctionsStub.getAccessToken.resolves();

      const handler = middleware(idamArgs);
      handler(req, res, next);

      setImmediate(() => {
        expect(res.clearCookie).to.have.been.calledOnce;
        expect(loggerStub.exception).to.have.been.calledOnce;
      });
    });
  });
});
