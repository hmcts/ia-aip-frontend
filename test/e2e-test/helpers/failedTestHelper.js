const Helper = require('@codeceptjs/helper');
const { event, output } = require('codeceptjs');
const process = require('process');
const assert = require('assert');

class FailedTest extends Helper {
  _failed() {
    global.testFailed = true;
  }
//  async _afterStep(step) {
//    const helper = this.helpers['Puppeteer'];
//    const unwantedStrings = ['idam', 'start-appeal', 'eligibility'];
//    const url = await helper.page.url();
//    const isNotContainingUnwantedString = string => !url.includes(string);
//    let retry = false;
//    try {
//      assert.ok(unwantedStrings.every(isNotContainingUnwantedString));
//      for (let i = 0; i < 10; i++) {
//        await helper.waitForText('Sign out', 20);
//        const content = await helper.page.content()
//        assert.ok(content.includes('Sorry, there is a problem with this service'))
//        await output.log('Saw flakey problem with service');
//        await helper.refreshPage();
//        await output.log('Reloaded page');
//        retry = true;
//      }
//    } catch (err) {
//      // do nothing
//      if (retry === true) {
//        step.run()
//      }
//    }
//  }
}

module.exports = FailedTest;
