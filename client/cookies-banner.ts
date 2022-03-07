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
    // tslint:disable-next-line
    if (!window.gtag) window.gtag = () => {};
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
      this.enableDynaCookies();
    });

    this.rejectCookiesButton.addEventListener('click', () => {
      this.addCookie('analytics_consent', 'no');
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
      this.hideCookieBanner();
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
      if (consent === 'yes') this.enableDynaCookies();
    } else {
      this.showCookieBanner();
    }
  }

  enableDynaCookies() {
    if (window.dtrum !== undefined) {
      window.dtrum.enable();
      window.dtrum.enableSessionReplay();
    }
  }

  addCookie(name, value) {
    document.cookie = `${name}=${value}; expires=${this.expiryDate}; path=/`;
  }

  removeCookie(name) {
    const hostname = window.location.hostname;
    const dotHostname = '.' + hostname;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${hostname};path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${dotHostname};path=/`;

    // for live
    const firstDot = hostname.indexOf('.');
    const upperDomain = hostname.substring(firstDot);
    const dotUpperDomain = '.' + upperDomain;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${upperDomain};path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${dotUpperDomain};path=/`;

    // for sub-live
    const dots = hostname.split('.');
    const subLiveUpperDomain = dots[dots.length - 2] + '.' + dots[dots.length - 1];
    const subLiveDotUpperDomain = '.' + subLiveUpperDomain;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${subLiveUpperDomain};path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${subLiveDotUpperDomain};path=/`;

    document.cookie = `${name}=; expires=${this.pastDate}; path=/`;
    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
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
