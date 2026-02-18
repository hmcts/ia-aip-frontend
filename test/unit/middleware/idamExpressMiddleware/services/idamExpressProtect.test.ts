import config from '../../../../../app/middleware/ia-idam-express-middleware/config';
import middleware from '../../../../../app/middleware/ia-idam-express-middleware/services/idamExpressProtect';
import idamWrapper from '../../../../../app/middleware/ia-idam-express-middleware/wrapper';
import { expect, sinon } from '../../../../utils/testUtils';

let req;
let res;
let next: sinon.SinonStub;
let sandbox: sinon.SinonSandbox;
const idamArgs = {};
const userDetails = {
  id: 'idam.user.id',
  email: 'email@email.com'
};

describe('idamExpressProtect', () => {
  it('should return a middleware handler', () => {
    const handler = middleware();
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    let handler;
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
        getIdamApiUrl: sandbox.stub().resolves(),
        getServiceAuth: sandbox.stub().resolves(),
        getIdamLoginUrl: sandbox.stub().resolves(),
        getUserDetails: sandbox.stub().resolves(userDetails),
        getAccessToken: sandbox.stub().resolves()
      };

      sandbox.stub(idamWrapper, 'setup').returns(idamFunctionsStub);
      handler = middleware(idamArgs);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('calls next on successful auth', () => {
      req.cookies[config.tokenCookieName] = 'token';

      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });
    });

    it('should set idam userDetails', () => {
      req.cookies[config.tokenCookieName] = 'token';

      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
        expect(req.idam.userDetails).to.equal(userDetails);
      });
    });

    it('redirects if getUserDetails rejects', () => {
      req.cookies[config.tokenCookieName] = 'token';

      idamFunctionsStub.getUserDetails.rejects();
      handler(req, res, next);

      setImmediate(() => {
        expect(res.redirect.callCount).to.equal(1);
      });
    });

    it('cookie to be removed if getUserDetails rejects', () => {
      req.cookies[config.tokenCookieName] = 'token';

      idamFunctionsStub.getUserDetails.rejects();
      handler(req, res, next);

      setImmediate(() => {
        expect(res.clearCookie.callCount).to.equal(1);
      });
    });

    it('redirects if no token cookie', () => {
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.redirect.callCount).to.equal(1);
    });
  });
});
