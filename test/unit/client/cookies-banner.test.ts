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
      <button id="saveCookies">Reject</button>
      <input type="radio" id="radio-analytics-on">on</input>
      <input type="radio" id="radio-analytics-off">off</input>
      <input type="radio" id="radio-apm-on">on</input>
      <input type="radio" id="radio-apm-off">off</input>
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
      const addSaveCookieEventListenerStub: sinon.SinonStub = sandbox.stub(cookiesBanner.saveButton, 'addEventListener');

      cookiesBanner.addEventListeners();

      expect(addAcceptCookieEventListenerStub).to.have.been.calledWith('click');
      expect(addRejectCookieEventListenerStub).to.have.been.calledWith('click');
      expect(addSaveCookieEventListenerStub).to.have.been.calledWith('click');
    });
  });

  describe('initAnalyticsCookie', () => {
    it('should show banner and deny cookies if cookie not present', () => {
      cookiesBanner.initAnalyticsCookie();

      expect(showCookieBannerSpy).to.have.been.called;
    });

    it('should hide banner and grant cookies if cookie is present', () => {
      cookiesBanner.addCookie('analytics_consent', 'yes');
      cookiesBanner.addCookie('apm_consent', 'yes');
      cookiesBanner.initAnalyticsCookie();

      expect(hideCookieBannerSpy).to.have.been.called;
      expect(window.gtag).to.have.been.calledWith('consent', 'update', {
        'analytics_storage': 'granted',
        'apm_storage': 'granted'
      });
    });

    it('should hide banner and grant cookies if cookie is present', () => {
      cookiesBanner.addCookie('analytics_consent', 'no');
      cookiesBanner.addCookie('apm_consent', 'no');
      cookiesBanner.initAnalyticsCookie();

      expect(hideCookieBannerSpy).to.have.been.called;
      expect(window.gtag).to.have.been.calledWith('consent', 'update', {
        'analytics_storage': 'denied',
        'apm_storage': 'denied'
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

  describe('Analytics and Performance selections should bet set from cookies', () => {
    it('should set the consent to yes from cookies', () => {
      cookiesBanner.addCookie('analytics_consent', 'yes');
      cookiesBanner.addCookie('apm_consent', 'yes');

      cookiesBanner.setAnalyticsAndApmSelectionsFromCookies();
      let analyticsSelectionOn: HTMLInputElement = document.querySelector('#radio-analytics-on');
      let apmSelectionOn: HTMLInputElement = document.querySelector('#radio-apm-on');
      expect(analyticsSelectionOn.checked).to.equal(false);
      expect(apmSelectionOn.checked).to.equal(false);
    });

    it('should set the consent to no from cookies', () => {
      cookiesBanner.addCookie('analytics_consent', 'no');
      cookiesBanner.addCookie('apm_consent', 'no');

      cookiesBanner.setAnalyticsAndApmSelectionsFromCookies();
      let analyticsSelectionOff: HTMLInputElement = document.querySelector('#radio-analytics-off');
      let apmSelectionOff: HTMLInputElement = document.querySelector('#radio-apm-off');
      expect(analyticsSelectionOff.checked).to.equal(false);
      expect(apmSelectionOff.checked).to.equal(false);
    });
  });

  describe('Analytics and Performance selections When cookies are accepted/rejected from the banner', () => {
    it('should set the consent radio buttons checked when accepted', () => {
      cookiesBanner.setAnalyticsAndApmSelectionsForAccepted();

      let analyticsSelectionOn: HTMLInputElement = document.querySelector('#radio-analytics-on');
      let apmSelectionOn: HTMLInputElement = document.querySelector('#radio-apm-on');
      expect(analyticsSelectionOn.checked).to.equal(false);
      expect(apmSelectionOn.checked).to.equal(false);
    });

    it('should set the consent to no when rejected', () => {
      cookiesBanner.setAnalyticsAndApmSelectionsForRejected();
      let analyticsSelectionOn: HTMLInputElement = document.querySelector('#radio-analytics-on');
      let apmSelectionOn: HTMLInputElement = document.querySelector('#radio-apm-on');
      expect(analyticsSelectionOn.checked).to.equal(false);
      expect(apmSelectionOn.checked).to.equal(false);
    });
  });
});
