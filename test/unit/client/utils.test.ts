import CookieBanner from '../../../client/cookies-banner';
import SessionTimeout from '../../../client/session-timeout';
import { initialize, ready } from '../../../client/utils';
import { expect, sinon } from '../../utils/testUtils';
const govUK = require('govuk-frontend');

describe('Client Utils', () => {
  let sandbox: sinon.SinonSandbox;
  let callbackStub: sinon.SinonStub;
  let cookieBannerStub: sinon.SinonStub;
  let sessionTimeoutStub: sinon.SinonStub;
  let initAllStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    callbackStub = sandbox.stub();
    cookieBannerStub = sandbox.stub(CookieBanner.prototype, 'init');
    sessionTimeoutStub = sandbox.stub(SessionTimeout.prototype, 'init');
    initAllStub = sandbox.stub(govUK, 'initAll');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('ready', () => {
    it('should call the callback', () => {
      ready(callbackStub);
      expect(callbackStub.callCount).to.equal(1);
    });
  });

  describe('initialize', () => {
    it('should initialize client libraries', () => {
      initialize();
      expect(initAllStub.callCount).to.equal(1);
      expect(cookieBannerStub.callCount).to.equal(1);
      expect(sessionTimeoutStub.callCount).to.equal(1);
    });
  });
});
