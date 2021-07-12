// @ts-ignore
import config from './cookies.json';

export class CheckCookies {
  public COOKIE_BANNER: string = 'app-cookie-banner';
  public cookieBannerElement: HTMLElement;
  public cookieBannerAcceptedElement: HTMLElement;
  public cookieBannerRejectedElement: HTMLElement;
  init(): void {
    const isCookieBanner = config.featureFlags.cookieBanner.enabled;
    if (isCookieBanner === 'false') {
      this.cookieBannerElement = document.getElementById('app-cookie-banner');
      this.cookieBannerAcceptedElement = document.getElementById('cookie-preference-success');
      this.cookieBannerRejectedElement = document.getElementById('cookie-preference-rejection');
      this.isCookiePrivacyMessageDisplayed();
    }
  }

  isCookiePrivacyMessageDisplayed(): void {
    let isSessionSeenCookieExist = document.cookie.indexOf('seen_cookie_message=1') > -1;
    let analyticsCookieExist = document.cookie.indexOf('analytics=1') > -1;
    if (analyticsCookieExist) {
      // tslint:disable-next-line:no-console
      console.log('analytics = ' + analyticsCookieExist);
    }
        // If Cookie Message is not shown in the past.
        // Add a seen_cookie_message  cookie to user's browser for one month.
    if (isSessionSeenCookieExist) {
      this.toggleBanner(false);
    } else {
      this.toggleBanner(true);
    }
  }

  toggleBanner(showCookieBanner: boolean): void {
    if (this.cookieBannerElement) {
      if (showCookieBanner) {
        this.cookieBannerElement.style.display = 'block';
        this.cookieBannerAcceptedElement.style.display = 'none';
        this.cookieBannerRejectedElement.style.display = 'none';
        let currentDate = new Date();
        let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        const acceptCookiesButton = document.getElementById('acceptCookies');
        acceptCookiesButton.addEventListener('click', function(e) {
          document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
          document.cookie = `analytics=1; expires=${expiryDate}; path=/`;
          document.cookie = `apm=1; expires=${expiryDate}; path=/`;
          document.getElementById('app-cookie-banner').style.display = 'none';
          document.getElementById('cookie-preference-success').style.display = 'block';
          const hideAcceptCookiesButton = document.getElementById('hideAcceptCookies');
          hideAcceptCookiesButton.addEventListener('click', function(e) {
            document.getElementById('cookie-preference-success').style.display = 'none';
          });
        });

        const rejectCookiesButton = document.getElementById('rejectCookies');
        rejectCookiesButton.addEventListener('click', function(e) {
          document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
          document.getElementById('app-cookie-banner').style.display = 'none';
          document.getElementById('cookie-preference-rejection').style.display = 'block';
          const hideRejectCookiesButton = document.getElementById('hideRejectCookies');
          hideRejectCookiesButton.addEventListener('click', function(e) {
            document.getElementById('cookie-preference-rejection').style.display = 'none';
          });
        });
      } else {
        this.cookieBannerElement.style.display = 'none';
        this.cookieBannerAcceptedElement.style.display = 'none';
        this.cookieBannerRejectedElement.style.display = 'none';
      }
    }
  }
}
