import CookiesBanner from '../../../client/cookies-banner';
import { expect, sinon } from '../../utils/testUtils';

describe('Cookies Banner', () => {
  let sandbox: sinon.SinonSandbox;
  let hideCookieBannerSpy: sinon.SinonSpy;
  let showCookieBannerSpy: sinon.SinonSpy;
  let addEventListenerStub: sinon.SinonStub;
  let initAnalyticsCookieStub: sinon.SinonStub;
  let cookiesBanner: CookiesBanner;
  const html = `<div id="cookie-banner">
      <button id="acceptCookies">Accept</button>
      <button id="rejectCookies">Reject</button>
    </div>`;

  before(() => {
    cookiesBanner = new CookiesBanner();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    document.body.innerHTML = html;
    window.gtag = sandbox.stub();
    hideCookieBannerSpy = sandbox.spy(CookiesBanner.prototype, 'hideCookieBanner');
    showCookieBannerSpy = sandbox.spy(CookiesBanner.prototype, 'showCookieBanner');
    sandbox.stub(CookiesBanner.prototype, 'removeCookie');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Initialization', () => {
    it('should call addEventListeners and initAnalyticsCookie', () => {
      addEventListenerStub = sandbox.stub(CookiesBanner.prototype, 'addEventListeners');
      initAnalyticsCookieStub = sandbox.stub(CookiesBanner.prototype, 'initAnalyticsCookie');

      cookiesBanner.init();

      expect(addEventListenerStub).to.have.been.calledOnce;
      expect(initAnalyticsCookieStub).to.have.been.calledOnce;
    });
  });

  describe('addEventListeners', () => {
    it('should add accept and reject events to buttons', () => {
      const addAcceptCookieEventListenerStub: sinon.SinonStub = sandbox.stub(cookiesBanner.acceptCookiesButton, 'addEventListener');
      const addRejectCookieEventListenerStub: sinon.SinonStub = sandbox.stub(cookiesBanner.rejectCookiesButton, 'addEventListener');

      cookiesBanner.addEventListeners();

      expect(addAcceptCookieEventListenerStub).to.have.been.calledWith('click');
      expect(addRejectCookieEventListenerStub).to.have.been.calledWith('click');
    });
  });

  describe('initAnalyticsCookie', () => {
    it('should show banner and deny cookies if cookie not present', () => {
      cookiesBanner.initAnalyticsCookie();

      expect(showCookieBannerSpy).to.have.been.called;
    });

    it('should hide banner and grant cookies if cookie is present', () => {
      cookiesBanner.addCookie('analytics_consent', 'yes');
      cookiesBanner.initAnalyticsCookie();

      expect(hideCookieBannerSpy).to.have.been.called;
      expect(window.gtag).to.have.been.calledWith('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted'
      });
    });

    it('should hide banner and grant cookies if cookie is present', () => {
      cookiesBanner.addCookie('analytics_consent', 'no');
      cookiesBanner.initAnalyticsCookie();

      expect(hideCookieBannerSpy).to.have.been.called;
      expect(window.gtag).to.have.been.calledWith('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied'
      });
    });
  });

  describe('Banner visibility', () => {
    it('should hide cookie banner', () => {
      cookiesBanner.hideCookieBanner();
      expect(cookiesBanner.cookieBanner.style.display).to.equal('none');
    });

    it('should show cookie banner', () => {
      cookiesBanner.showCookieBanner();
      expect(cookiesBanner.cookieBanner.style.display).to.equal('block');
    });
  });

});
