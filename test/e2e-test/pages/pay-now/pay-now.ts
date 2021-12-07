import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  payNow(I) {

    Then(/^I should be taken to the pay now page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });
    When(/^I click on Yes and click Save and continue$/, async () => {
      await I.checkOption('Yes');
      await I.click('Save and continue');
    });
  }
};
