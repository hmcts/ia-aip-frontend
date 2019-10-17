import CookiesBanner from '../../../client/cookies-banner';
import { expect, sinon } from '../../utils/testUtils';

describe('Cookies Banner', () => {
  let sandbox: sinon.SinonSandbox;
  let hideCookieBannerSpy: sinon.SinonSpy;
  let showCookieBannerSpy: sinon.SinonSpy;
  let cookiesBanner: CookiesBanner;
  const html = `<div id="cookie-banner">Cookie banner</div>`;

  before(() => {
    cookiesBanner = new CookiesBanner();
    document.body.innerHTML = html;
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    hideCookieBannerSpy = sandbox.spy(CookiesBanner.prototype, 'hideCookieBanner');
    showCookieBannerSpy = sandbox.spy(CookiesBanner.prototype, 'showCookieBanner');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call init and addCookie and show the cookie banner when cookie is missing', () => {
    cookiesBanner.init();
    expect(hideCookieBannerSpy).to.not.have.been.calledOnce;
    expect(showCookieBannerSpy).to.have.been.calledOnce;
  });

  it('should call init and hide cookie when cookie is present', () => {
    cookiesBanner.init();
    expect(hideCookieBannerSpy).to.have.been.calledOnce;
    expect(showCookieBannerSpy).to.not.have.been.calledOnce;
  });

  it('should hide cookie banner', () => {
    cookiesBanner.hideCookieBanner();
    expect(cookiesBanner.cookieBanner.style.display).to.equal('none');
  });

  it('should show cookie banner', () => {
    cookiesBanner.showCookieBanner();
    expect(cookiesBanner.cookieBanner.style.display).to.equal('block');
  });

  it('does nothing if cookie banner is not present', () => {
    document.body.innerHTML = '';
    cookiesBanner.init();
    expect(hideCookieBannerSpy).to.not.have.been.calledOnce;
    expect(showCookieBannerSpy).to.not.have.been.calledOnce;
  });
});
