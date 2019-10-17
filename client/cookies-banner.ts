interface ICookies {
  init: () => void;
  addCookie: () => void;
  hideCookieBanner: () => void;
  showCookieBanner: () => void;
}

export default class CookiesBanner implements ICookies {
  public cookieBanner: HTMLElement = null;

  init() {
    this.cookieBanner = document.querySelector('#cookie-banner');
    const isSessionSeenCookieExist = document.cookie.indexOf('seen_cookie_message=1') > -1;
    if (this.cookieBanner) {
      if (isSessionSeenCookieExist) {
        this.hideCookieBanner();
      } else {
        this.addCookie();
        this.showCookieBanner();
      }
    }
  }

  addCookie() {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
  }

  hideCookieBanner() {
    this.cookieBanner.style.display = 'none';
  }

  showCookieBanner() {
    this.cookieBanner.style.display = 'block';
  }
}
