const sinon = require('sinon');
const { expect } = require('chai');
const config = require('../config');
const idamWrapper = require('../wrapper');
const middleware = require('./idamUserDetails');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

let req = null;
let res = null;
let next = null;
const idamArgs = {};
const userDetails = {
  id: 'idam.user.id',
  email: 'email@email.com'
};

describe('idamUserDetails', () => {
  it('should return a middleware handler', () => {
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
      let idamExpressProtect = null;
      let getUserDetails = null;

      beforeEach(() => {
        getUserDetails = sinon.stub().returnsPromise();
        sinon.stub(idamWrapper, 'setup').returns({ getUserDetails });
        idamExpressProtect = middleware(idamArgs);
      });

      afterEach(() => {
        idamWrapper.setup.restore();
      });

      it('calls next on successful auth', () => {
        req.cookies[config.tokenCookieName] = 'token';

        getUserDetails.resolves(userDetails);
        idamExpressProtect(req, res, next);

        expect(getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });

      it('should set idam userDetails', () => {
        req.cookies[config.tokenCookieName] = 'token';

        getUserDetails.resolves(userDetails);
        idamExpressProtect(req, res, next);

        expect(getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
        expect(req.idam.userDetails).to.equal(userDetails);
      });

      it('calls next if getUserDetails rejects', () => {
        req.cookies[config.tokenCookieName] = 'token';

        getUserDetails.rejects();
        idamExpressProtect(req, res, next);

        expect(getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });

      it('cookie to be removed if getUserDetails rejects', () => {
        req.cookies[config.tokenCookieName] = 'token';

        getUserDetails.rejects();
        idamExpressProtect(req, res, next);

        expect(res.clearCookie.callCount).to.equal(1);
      });

      it('cookie to be removed if getUserDetails rejects', () => {
        req.cookies[config.tokenCookieName] = 'token';

        getUserDetails.rejects();
        idamExpressProtect(req, res, next);

        expect(res.clearCookie.callCount).to.equal(1);
      });
    }

    it('calls next if no token cookie', () => {
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(next.callCount).to.equal(1);
    });
  });
});
