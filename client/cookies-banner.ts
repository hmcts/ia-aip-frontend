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
    this.acceptCookiesButton = document.querySelector('#acceptCookies');
    this.rejectCookiesButton = document.querySelector('#rejectCookies');
    this.addEventListeners();

    const analyticsCookieExist = document.cookie.indexOf('analytics_consent') > -1;
    if (analyticsCookieExist) {
      const consent = this.getCookieValue('analytics_consent');
      this.hideCookieBanner();
      if (consent === 'yes') {
        window.gtag('consent', 'default', {
          'ad_storage': 'denied',
          'analytics_storage': 'granted'
        });
      } else if (consent === 'no') {
        window.gtag('consent', 'default', {
          'ad_storage': 'denied',
          'analytics_storage': 'denied'
        });
      }
      // console.log('INIT: analytics cookie exist, grant consent');
    } else {
      // console.log('INIT: analytics cookie DOES NOT exist, deny consent');
      this.showCookieBanner();
      window.gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied'
      });
    }

    // const isSessionSeenCookieExist = document.cookie.indexOf('seen_cookie_message=1') > -1;
    // if (this.cookieBanner) {
    //   if (isSessionSeenCookieExist) {
    //     this.hideCookieBanner();
    //   } else {
    //     this.addCookie('seen_cookie_message');
    //     this.showCookieBanner();
    //   }
    // }
  }

  addEventListeners() {
    this.acceptCookiesButton.addEventListener('click', () => {
      // console.log('BANNER: accept cookies');
      this.addCookie('analytics_consent', 'yes');
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      this.hideCookieBanner();
    });

    this.rejectCookiesButton.addEventListener('click', () => {
      // console.log('BANNER: reject cookies')
      this.addCookie('analytics_consent', 'no');
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
      this.hideCookieBanner();
    });
  }

  addCookie(name, value) {
    document.cookie = `${name}=${value}; expires=${this.expiryDate}; path=/`;
  }

  removeCookie(name) {
    // console.log('removing cookie with date', this.pastDate)
    document.cookie = `${name}=; expires=${this.pastDate}; path=/`;
  }

  getCookieValue(name) {
    // tslint:disable-next-line
    return document.cookie.split('; ').find(row => row.startsWith(`${name}=`)).split('=')[1];
  }

  hideCookieBanner() {
    this.cookieBanner.style.display = 'none';
  }

  showCookieBanner() {
    this.cookieBanner.style.display = 'block';
  }
}
