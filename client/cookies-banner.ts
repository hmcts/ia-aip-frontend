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
      this.addCookie('cookies_policy', '{"essential":true,"analytics":true,"apm":true}');
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      this.hideCookieBanner();
    });

    this.rejectCookiesButton.addEventListener('click', () => {
      this.addCookie('analytics_consent', 'no');
      this.addCookie('cookies_policy', '{"essential":true,"analytics":false,"apm":false}');
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
      if (consent === 'yes') {
        window.gtag('js', new Date());
        window.gtag('config', 'UA-159574540-1');
      }
    } else {
      this.showCookieBanner();
      // window.gtag('consent', 'default', {
      //   'ad_storage': 'denied',
      //   'analytics_storage': 'denied'
      // });
    }
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
