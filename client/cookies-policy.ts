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
      this.apmOn = document.getElementById('radio-apm-on');
      this.apmOn.setAttribute('checked', 'checked');
    } else {
      this.analyticsOff = document.getElementById('radio-analytics-off');
      this.analyticsOff.setAttribute('checked', 'checked');
      this.apmOff = document.getElementById('radio-apm-off');
      this.apmOff.setAttribute('checked', 'checked');
    }
  }
}
