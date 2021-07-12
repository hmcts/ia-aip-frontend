export class CookiePolicy {
  public analyticsOn: HTMLElement;
  public analyticsOff: HTMLElement;
  public apmOn: HTMLElement;
  public apmOff: HTMLElement;

  init(): void {
    let analyticsCookieExist = document.cookie.indexOf('analytics=1') > -1;
    if (analyticsCookieExist) {
      this.analyticsOn = document.getElementById('radio-analytics-on');
      this.analyticsOn.setAttribute('checked', 'checked');
    } else {
      this.analyticsOff = document.getElementById('radio-analytics-off');
      this.analyticsOff.setAttribute('checked', 'checked');
    }
    let apmCookieExist = document.cookie.indexOf('apm=1') > -1;
    if (apmCookieExist) {
      this.apmOn = document.getElementById('radio-apm-on');
      this.apmOn.setAttribute('checked', 'checked');
    } else {
      this.apmOff = document.getElementById('radio-apm-off');
      this.apmOff.setAttribute('checked', 'checked');
    }
    const saveCookiesPreferences = document.getElementById('save-cookie-preferences');
    saveCookiesPreferences.addEventListener('click', function(e) {
      let currentDate = new Date();
      let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
      let analyticsOn = document.getElementById('radio-analytics-on');
      if (analyticsOn.getAttribute('checked')) {
        document.cookie = `analytics=1; expires=${expiryDate}; path=/`;
      } else {
        document.cookie = `analytics=; expires=; path=`;
      }
      let apmOn = document.getElementById('radio-apm-on');
      if (apmOn.getAttribute('checked')) {
        document.cookie = `apm=1; expires=${expiryDate}; path=/`;
      } else {
        document.cookie = `apm=; expires=; path=`;
      }
      document.location.href = '/';
    });

  }
}
