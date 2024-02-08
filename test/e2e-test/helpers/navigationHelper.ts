'use strict';
const assert = require('assert');
const HelperClass = require('@codeceptjs/helper');
const output = require('codeceptjs').output;

class NavigationHelper extends HelperClass {
  async checkIfLogInIsSuccessful(timeout: number) {
    const helper = this.helpers['Puppeteer']; // Or change to another Helper
    try {
      await helper.wait(timeout);
      assert.ok(helper.page.url().includes('appeal-overview'));
      await helper.see('Sign out');
      await helper.seeInTitle(`Your appeal overview`);
      return true;
    } catch (err) {
      return false;
    }
  }

  async checkIfExUiLogInIsSuccessful() {
    const helper = this.helpers['Puppeteer']; // Or change to another Helper
    try {
      await helper.wait(3);
      assert.ok(helper.page.url().includes('cases'));
      await helper.waitForText('Sign out', 30);
      await helper.see('Sign out');
      await helper.waitForText('Your cases', 60);
      await helper.waitForInvisible('div.spinner', 60);
      return true;
    } catch (err) {
      // tslint:disable:no-console
      console.log('login unsuccessful');
      // tslint:disable:no-console
      console.log(err);
      return false;
    }
  }
}

module.exports = NavigationHelper;
