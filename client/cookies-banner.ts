import { isNull } from 'lodash';

interface ICookies {
  init: () => void;
  addCookie: (name: string, value: string) => void;
  hideCookieBanner: () => void;
  showCookieBanner: () => void;
}

export default class CookiesBanner implements ICookies {
  public cookieBanner: HTMLElement = null;
  public acceptCookiesButton: HTMLElement = null;
  public rejectCookiesButton: HTMLElement = null;
  private currentDate = new Date();
  private expiryDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
  private pastDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 2));

  init() {
    this.cookieBanner = document.querySelector('#cookie-banner');
    if (isNull(this.cookieBanner)) { return; }
    this.acceptCookiesButton = document.querySelector('#acceptCookies');
    this.rejectCookiesButton = document.querySelector('#rejectCookies');
    this.addEventListeners();
    this.initAnalyticsCookie();
  }

  addEventListeners() {
    this.acceptCookiesButton.addEventListener('click', () => {
      this.addCookie('analytics_consent', 'yes');
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      this.hideCookieBanner();
    });

    this.rejectCookiesButton.addEventListener('click', () => {
      this.addCookie('analytics_consent', 'no');
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
      this.hideCookieBanner();
      this.removeDynaCookies();
    });
  }

  initAnalyticsCookie() {
    const analyticsCookieExist = document.cookie.indexOf('analytics_consent') > -1;
    if (analyticsCookieExist) {
      this.hideCookieBanner();
      const consent = this.getCookieValue('analytics_consent');
      window.gtag('consent', 'update', {
        'ad_storage': consent === 'yes' ? 'granted' : 'denied',
        'analytics_storage': consent === 'yes' ? 'granted' : 'denied'
      });
      if (consent === 'no') this.removeDynaCookies();
    } else {
      this.showCookieBanner();
      this.removeDynaCookies();
    }
  }

  removeDynaCookies() {
    this.removeCookie('dtCookie');
    this.removeCookie('dtLatC');
    this.removeCookie('dtPC');
    this.removeCookie('dtSa');
    this.removeCookie('rxVisitor');
    this.removeCookie('rxvt');
  }

  addCookie(name, value) {
    document.cookie = `${name}=${value}; expires=${this.expiryDate}; path=/`;
  }

  removeCookie(name) {
    document.cookie = `${name}=; expires=${this.pastDate}; path=/`;
  }

  getCookieValue(name) {
    return document.cookie.split('; ').find(row => row.startsWith(`${name}=`)).split('=')[1];
  }

  hideCookieBanner() {
    this.cookieBanner.style.display = 'none';
  }

  showCookieBanner() {
    this.cookieBanner.style.display = 'block';
  }
}
