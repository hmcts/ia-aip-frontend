import { SinonStub } from 'sinon';
import config from '../../../../../app/middleware/ia-idam-express-middleware/config';
import middleware from '../../../../../app/middleware/ia-idam-express-middleware/services/idamExpressLanding';
import idamWrapper from '../../../../../app/middleware/ia-idam-express-middleware/wrapper';
import Logger, * as LoggerModule from '../../../../../app/utils/logger';
import { expect, sinon } from '../../../../utils/testUtils';

describe('idamExpressLanding', () => {
  let req;
  let res;
  let next: SinonStub;
  let sandbox: sinon.SinonSandbox;
  let loggerStub: sinon.SinonStubbedInstance<Logger>;
  let loggerExceptionStub: sinon.SinonStub;
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
      loggerExceptionStub = sandbox.stub();
      loggerStub = sandbox.createStubInstance(Logger, {
        // @ts-expect-error in order for test
        exception: loggerExceptionStub
      });
      sandbox.stub(LoggerModule, 'default').callsFake(function FakeLogger() {
        return loggerStub;
      } as any);

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
        expect(idamFunctionsStub.getAccessToken.callCount).to.equal(1);
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(res.cookie.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
        expect(loggerExceptionStub.called).to.equal(false);
      });
    });

    it('should set idam userDetails', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'state';

      idamFunctionsStub.getAccessToken.resolves(response);
      idamFunctionsStub.getUserDetails.resolves(userDetails);

      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getAccessToken.callCount).to.equal(1);
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(res.cookie.callCount).to.equal(1);
        expect(req.cookies['__auth-token']).to.deep.equal(response.access_token);
        expect(next.callCount).to.equal(1);
        expect(req.idam.userDetails).to.equal(userDetails);
        expect(loggerExceptionStub.called).to.equal(false);
      });
    });

    it('redirects if error with getAccessToken response', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'state';

      idamFunctionsStub.getAccessToken.rejects();
      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getAccessToken.callCount).to.equal(1);
        expect(res.redirect.callCount).to.equal(1);
        expect(res.redirect.calledWith('/')).to.equal(true);
        expect(next.called).to.equal(false);
        expect(loggerExceptionStub.callCount).to.equal(1);
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
          expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
          expect(res.cookie.callCount).to.equal(1);
          expect(next.callCount).to.equal(1);
          expect(req.cookies[config.tokenCookieName]).to.equal(testToken);
          expect(loggerExceptionStub.called).to.equal(false);
        });
      });

      it('should do nothing but call next when authToken is invalid', () => {
        req.query[config.tokenCookieName] = 'invalidAuthToken';

        handler(req, res, next);

        expect(res.redirect.called).to.equal(false);
        expect(next.callCount).to.equal(1);
        expect(loggerExceptionStub.called).to.equal(false);
      });

      it('should redirect if authToken is unauthorised', () => {
        idamFunctionsStub.getUserDetails.rejects();

        handler(req, res, next);

        setImmediate(() => {
          expect(res.redirect.callCount).to.equal(1);
          expect(res.redirect.calledWith('/')).to.equal(true);
          expect(next.called).to.equal(false);
          expect(loggerExceptionStub.callCount).to.equal(1);
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
        expect(res.redirect.callCount).to.equal(1);
        expect(loggerExceptionStub.callCount).to.equal(1);
      });
    });

    it('redirects if no code exists', () => {
      req.cookies[config.stateCookieName] = 'state';
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.redirect.callCount).to.equal(1);
      expect(loggerExceptionStub.callCount).to.equal(1);
    });

    it('removes old state cookie', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'uuid';
      idamFunctionsStub.getUserDetails.resolves(userDetails);
      idamFunctionsStub.getAccessToken.resolves();

      const handler = middleware(idamArgs);
      handler(req, res, next);

      setImmediate(() => {
        expect(res.clearCookie.callCount).to.equal(1);
        expect(loggerExceptionStub.callCount).to.equal(1);
      });
    });
  });
});
