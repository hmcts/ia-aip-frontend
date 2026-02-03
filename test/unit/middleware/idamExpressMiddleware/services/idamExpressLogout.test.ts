import axios from 'axios';
import { SinonStub } from 'sinon';
import middleware from '../../../../../app/middleware/ia-idam-express-middleware/services/idamExpressLogout';
import cookies from '../../../../../app/middleware/ia-idam-express-middleware/utilities/cookies';
import idamWrapper from '../../../../../app/middleware/ia-idam-express-middleware/wrapper';
import { expect, sinon } from '../../../../utils/testUtils';

const idamApiUrl = '/idamApiUrl';
const authToken = 'token';
const logoutUrl = `${idamApiUrl}/session/${authToken}`;
const serviceAuth = 'base64String';
const options = {
  headers: {
    Authorization: `Basic ${serviceAuth}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
const userDetails = {
  id: 'idam.user.id',
  email: 'email@email.com'
};
const accessToken = { body: { access_token: 'access_token' } };
const idamArgs = {
  state: () => {
    return '__state__';
  }
};
describe('idamExpressLogout', () => {
  let req;
  let res;
  let next: SinonStub;
  let sandbox: sinon.SinonSandbox;
  it('should return a middleware handler', () => {
    const handler = middleware();
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    sandbox = sinon.createSandbox();
    let handler;
    let requestDeleteStub: SinonStub;
    beforeEach(() => {
      req = { cookies: {} };
      res = { cookie: sandbox.stub() };
      next = sandbox.stub();

      const idamFunctionsStub = {
        getIdamApiUrl: sandbox.stub().returns(idamApiUrl),
        getServiceAuth: sandbox.stub().returns(serviceAuth),
        getIdamLoginUrl: sandbox.stub().returns('http://login.url'),
        getUserDetails: sandbox.stub().returns(userDetails),
        getAccessToken: sandbox.stub().returns(accessToken)
      };

      sandbox.stub(idamWrapper, 'setup').returns(idamFunctionsStub);
      sandbox.stub(cookies, 'get').returns(authToken);
      sandbox.stub(cookies, 'remove').returns(authToken);
      requestDeleteStub = sandbox.stub(axios, 'delete');
      handler = middleware(idamArgs);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('logs the user out of idam', () => {
      // Arrange.
      requestDeleteStub.resolves();

      handler(req, res, next);

      setImmediate(() => {
        expect(idamWrapper.setup).to.have.been.calledOnce;
        expect(cookies.get).to.have.been.calledOnce;
        expect(axios.delete).to.have.been.calledOnce;
        expect(axios.delete).to.have.been.calledWith(logoutUrl, options);
        expect(cookies.remove).to.have.been.calledOnce;
      });
    });

    it('logs error and calls next when promise rejects', () => {
      // Arrange.
      requestDeleteStub.rejects();

      handler(req, res, next);
      // Assert
      setImmediate(() => {
        expect(idamWrapper.setup).to.have.been.calledOnce;
        expect(cookies.get).to.have.been.calledOnce;
        expect(axios.delete).to.have.been.calledOnce;
        expect(axios.delete).to.have.been.calledWith(logoutUrl, options);
      });
    });
  });
});
