'use strict';
import configFile from 'config';

const assert = require('assert');
const HelperClass = require('@codeceptjs/helper');
const testUrl: string = configFile.get('testUrl');

class NavigationHelper extends HelperClass {
  async checkIfLogInIsSuccessful(timeout: number) {
    const helper = this.helpers['Puppeteer']; // Or change to another Helper
    try {
      await helper.wait(timeout);
      assert.ok(helper.page.url().includes('cases-list'));
      await helper.see('Sign out');
      await helper.seeInTitle(`Your appeals`);
      return true;
    } catch (err) {
      return false;
    }
  }

  async checkIfExUiLogInIsSuccessful() {
    const helper = this.helpers['Puppeteer']; // Or change to another Helper
    try {
      await helper.wait(15);
      assert.ok(helper.page.url().includes('cases'));
      await helper.waitForText('Sign out', 30);
      await helper.see('Sign out');
      await helper.waitForText('Your cases', 60);
      await helper.waitForInvisible('div.spinner', 60);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('login unsuccessful');
      // eslint-disable-next-line no-console
      console.log(err);
      return false;
    }
  }

  async handleNextStep(awaitedText: string, eventUrl: string, appealReference: string) {
    let exuiBaseUrl: string;
    if (testUrl.includes('localhost')) {
      exuiBaseUrl = 'http://localhost:3002/';
    } else if (testUrl.includes('aat') || testUrl.includes('preview')) {
      exuiBaseUrl = 'https://manage-case.aat.platform.hmcts.net/';
    } else if (testUrl.includes('demo')) {
      exuiBaseUrl = 'https://manage-case.demo.platform.hmcts.net/';
    }
    const helper = this.helpers['Puppeteer'];
    try {
      await helper.click('Go');
      await helper.waitForText(awaitedText, 30);
    } catch {
      await helper.amOnPage(exuiBaseUrl + 'cases/case-details/' + appealReference + '/trigger/' + eventUrl);
      await helper.waitForText(awaitedText, 60);
    }
  }
}

module.exports = NavigationHelper;
