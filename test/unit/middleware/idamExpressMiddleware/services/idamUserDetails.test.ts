import config from '../../../../../app/middleware/ia-idam-express-middleware/config';
import middleware from '../../../../../app/middleware/ia-idam-express-middleware/services/idamUserDetails';
import idamWrapper from '../../../../../app/middleware/ia-idam-express-middleware/wrapper';
import { expect, sinon } from '../../../../utils/testUtils';

let req = null;
let res = null;
let next: sinon.SinonStub;
let sandbox: sinon.SinonSandbox;
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
        getUserDetails: sandbox.stub(),
        getIdamLoginUrl: sandbox.stub(),
        getIdamApiUrl: sandbox.stub(),
        getServiceAuth: sandbox.stub(),
        getAccessToken: sandbox.stub()
      };
      sandbox.stub(idamWrapper, 'setup').returns(idamFunctionsStub);
      handler = middleware(idamArgs);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('calls next on successful auth', () => {
      req.cookies[config.tokenCookieName] = 'token';

      idamFunctionsStub.getUserDetails.resolves(userDetails);
      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });
    });

    it('should set idam userDetails', () => {
      req.cookies[config.tokenCookieName] = 'token';

      idamFunctionsStub.getUserDetails.resolves(userDetails);
      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
        expect(req.idam.userDetails).to.equal(userDetails);
      });
    });

    it('calls next if getUserDetails rejects', () => {
      req.cookies[config.tokenCookieName] = 'token';

      idamFunctionsStub.getUserDetails.rejects();
      handler(req, res, next);

      setImmediate(() => {
        expect(idamFunctionsStub.getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
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

    it('cookie to be removed if getUserDetails rejects', () => {
      req.cookies[config.tokenCookieName] = 'token';

      idamFunctionsStub.getUserDetails.rejects();
      handler(req, res, next);

      setImmediate(() => {
        expect(res.clearCookie.callCount).to.equal(1);
      });
    });

    it('calls next if no token cookie', () => {
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(next.callCount).to.equal(1);
    });
  });
});
