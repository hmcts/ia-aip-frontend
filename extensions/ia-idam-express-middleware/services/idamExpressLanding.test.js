const sinon = require('sinon');
const { expect } = require('chai');
const config = require('../config');
const idamWrapper = require('../wrapper');
const middleware = require('./idamExpressLanding');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

let req = null;
let res = null;
let next = null;
const idamArgs = { indexUrl: '/' };
const userDetails = {
  id: 'idam.user.id',
  email: 'email@email.com'
};

describe('idamExpressLanding', () => {
  it('returns a middleware handler', () => {
    const handler = middleware();
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    beforeEach(() => {
      req = {
        cookies: {},
        query: []
      };
      res = {
        redirect: sinon.stub(),
        cookie: sinon.stub(),
        clearCookie: sinon.stub()
      };
      next = sinon.stub();
    });

    {
      let getAccessToken = null;
      let idamExpressLanding = null;
      let getUserDetails = null;

      beforeEach(() => {
        getAccessToken = sinon.stub().returnsPromise();
        getUserDetails = sinon.stub().returnsPromise();
        sinon.stub(idamWrapper, 'setup').returns({ getAccessToken, getUserDetails });
        idamExpressLanding = middleware(idamArgs);
      });

      afterEach(() => {
        idamWrapper.setup.restore();
      });

      it('calls next on successful auth', () => {
        req.query.code = 'code';
        req.cookies[config.stateCookieName] = 'state';

        const response = { body: { access_token: 'access_token' } };
        getAccessToken.resolves(response);
        getUserDetails.resolves(userDetails);

        idamExpressLanding(req, res, next);

        expect(getAccessToken.callCount).to.equal(1);
        expect(getUserDetails.callCount).to.equal(1);
        expect(res.cookie.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });

      it('should set idam userDetails', () => {
        req.query.code = 'code';
        req.cookies[config.stateCookieName] = 'state';

        const response = { access_token: 'access_token' };
        getAccessToken.resolves(response);
        getUserDetails.resolves(userDetails);

        idamExpressLanding(req, res, next);

        expect(getAccessToken.callCount).to.equal(1);
        expect(getUserDetails.callCount).to.equal(1);
        expect(res.cookie.callCount).to.equal(1);
        expect(req.cookies['__auth-token']).to.eql(response.access_token);
        expect(next.callCount).to.equal(1);
        expect(req.idam.userDetails).to.equal(userDetails);
      });

      it('redirects if error with getAccessToken response', () => {
        req.query.code = 'code';
        req.cookies[config.stateCookieName] = 'state';

        getAccessToken.rejects();
        idamExpressLanding(req, res, next);

        expect(getAccessToken.callCount).to.equal(1);
        expect(res.redirect.callCount).to.equal(1);
        expect(res.redirect.calledWith('/')).to.equal(true);
        expect(next.callCount).to.equal(0);
      });

      context('authToken query', () => {
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.DjwRE2jZhren2Wt37t5hlVru6Myq4AhpGLiiefF69u8';

        beforeEach(() => {
          req.query[config.tokenCookieName] = testToken;
        });

        it('should set the authToken cookie with the query value', () => {
          getUserDetails.resolves(userDetails);

          idamExpressLanding(req, res, next);

          expect(getUserDetails.callCount).to.equal(1);
          expect(res.cookie.callCount).to.equal(1);
          expect(next.callCount).to.equal(1);
          expect(req.cookies[config.tokenCookieName]).to.equal(testToken);
        });

        it('should do nothing but call next when authToken is invalid', () => {
          req.query[config.tokenCookieName] = 'invalidAuthToken';

          idamExpressLanding(req, res, next);

          expect(res.redirect.callCount).to.equal(0);
          expect(next.callCount).to.equal(1);
        });

        it('should redirect if authToken is unauthorised', () => {
          getUserDetails.rejects();

          idamExpressLanding(req, res, next);

          expect(res.redirect.callCount).to.equal(1);
          expect(res.redirect.calledWith('/')).to.equal(true);
          expect(next.callCount).to.equal(0);
        });
      });
    }

    it('redirects if no state exists', () => {
      req.query.code = 'code';
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.redirect.callCount).to.equal(1);
    });

    it('redirects if no code exists', () => {
      req.cookies[config.stateCookieName] = 'state';
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.redirect.callCount).to.equal(1);
    });

    it('removes old state cookie', () => {
      req.query.code = 'code';
      req.cookies[config.stateCookieName] = 'state';

      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.clearCookie.callCount).to.equal(1);
    });
  });
});
