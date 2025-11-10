const sinon = require('sinon');
const { expect } = require('chai');
const idamWrapper = require('../wrapper');
const middleware = require('./idamExpressLogout');
const sinonStubPromise = require('sinon-stub-promise');
const request = require('request-promise-native');
const cookies = require('../utilities/cookies');

sinonStubPromise(sinon);

let req = null;
let res = null;
let next = null;
const idamApiUrl = '/idamApiUrl';
const authToken = 'token';
const logoutUrl = `${idamApiUrl}/session/${authToken}`;
const serviceAuth = 'base64String';
const options = {
  uri: logoutUrl,
  headers: {
    Authorization: `Basic ${serviceAuth}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
describe('idamExpressLogout', () => {
  it('should return a middleware handler', () => {
    const handler = middleware();
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    beforeEach(() => {
      req = { cookies: {} };
      res = { cookie: sinon.stub() };
      next = sinon.stub();

      const idamFunctionsStub = {
        getIdamApiUrl: sinon.stub()
          .returns(idamApiUrl),
        getServiceAuth: sinon.stub()
          .returns(serviceAuth)
      };
      sinon.stub(idamWrapper, 'setup').returns(idamFunctionsStub);
      sinon.stub(cookies, 'get').returns(authToken);
      sinon.stub(cookies, 'remove').returns(authToken);
      sinon.stub(request, 'delete');
    });

    afterEach(() => {
      cookies.get.restore();
      cookies.remove.restore();
      idamWrapper.setup.restore();
      request.delete.restore();
    });

    it('logs the user out of idam', done => {
      // Arrange.
      request.delete.resolves();
      const handler = middleware();

      // Act
      handler(req, res, next)
        .then(() => {
          // Assert
          expect(idamWrapper.setup.calledOnce).to.eql(true);
          expect(cookies.get.calledOnce).to.eql(true);
          expect(request.delete.calledOnce).to.eql(true);
          expect(request.delete.calledWith(options)).to.eql(true);
          expect(cookies.remove.calledOnce).to.eql(true);
        })
        .then(done, done);
    });
    it('logs error and calls next when promise rejects', done => {
      // Arrange.
      request.delete.rejects();
      const handler = middleware();

      // Act
      handler(req, res, next)
        .then(() => {
          // Assert
          expect(idamWrapper.setup.calledOnce).to.eql(true);
          expect(cookies.get.calledOnce).to.eql(true);
          expect(request.delete.calledOnce).to.eql(true);
          expect(request.delete.calledWith(options)).to.eql(true);
        })
        .then(done, done);
    });
  });
});
