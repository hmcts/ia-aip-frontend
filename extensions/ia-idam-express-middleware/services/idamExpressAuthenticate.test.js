const sinon = require('sinon');
const { expect } = require('chai');
const idamWrapper = require('../wrapper');
const middleware = require('./idamExpressAuthenticate');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

let req = null;
let res = null;
let next = null;
const idamArgs = {
  state: () => {
    return '__state__';
  }
};
const userDetails = {
  id: 'idam.user.id',
  email: 'email@email.com'
};

describe('idamExpressAuthenticate', () => {
  it('should return a middleware handler', () => {
    const handler = middleware();
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    beforeEach(() => {
      req = { cookies: {} };
      res = {
        redirect: sinon.stub(),
        cookie: sinon.stub(),
        clearCookie: sinon.stub()
      };
      next = sinon.stub();
    });

    {
      let getIdamLoginUrl = null;
      let idamExpressAuthenticate = null;
      let getUserDetails = null;

      beforeEach(() => {
        getUserDetails = sinon.stub().returnsPromise();
        getIdamLoginUrl = sinon.stub().returns('/');
        sinon.stub(idamWrapper, 'setup').returns({ getUserDetails, getIdamLoginUrl });
        idamExpressAuthenticate = middleware(idamArgs);
      });

      afterEach(() => {
        idamWrapper.setup.restore();
      });

      describe('with custom state', () => {
        it('should pass the state as redirection', () => {
          idamExpressAuthenticate(req, res, next);
          expect(getIdamLoginUrl.calledWith({ state: '__state__' })).to.equal(true);
        });
      });


      describe('no auth token', () => {
        it('should call getIdamLoginUrl', () => {
          idamExpressAuthenticate(req, res, next);

          expect(getIdamLoginUrl.callCount).to.equal(1);
          expect(res.cookie.callCount).to.equal(1);
        });
      });
      describe('with auth token', () => {
        beforeEach(() => {
          req = { cookies: { '__auth-token': 'token' } };
        });

        it('should call next if getUserDetails resolves', () => {
          getUserDetails.resolves(userDetails);
          idamExpressAuthenticate(req, res, next);

          expect(getUserDetails.callCount).to.equal(1);
          expect(next.callCount).to.equal(1);
        });

        it('should set idam userDetails if getUserDetails resolves', () => {
          getUserDetails.resolves(userDetails);
          idamExpressAuthenticate(req, res, next);

          expect(getUserDetails.callCount).to.equal(1);
          expect(req.idam.userDetails).to.equal(userDetails);
          expect(next.callCount).to.equal(1);
        });

        it('should call next if getIdamLoginUrl if getUserDetails rejects', () => {
          getUserDetails.rejects();
          idamExpressAuthenticate(req, res, next);

          expect(getUserDetails.callCount).to.equal(1);
          expect(getIdamLoginUrl.callCount).to.equal(1);
          expect(res.cookie.callCount).to.equal(1);
        });
      });
    }

    describe('state cookie', () => {
      it('should remove state cookie', () => {
        req.cookies.__state = 'uuid';
        const handler = middleware();
        handler(req, res, next);

        expect(res.clearCookie.callCount).to.equal(1);
      });
    });
  });
});
