import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  feeSupport(I) {
    Given('I am on the deportation order page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.feeSupport);
    });

    Then(/^I go to the support to pay the fee page$/, async () => {
      await I.waitInUrl(paths.appealStarted.deportationOrder,20);
      await I.seeInCurrentUrl(paths.appealStarted.feeSupport);
    });

    When(/^I choose Asylum support and click save and continue$/, async () => {
      await I.checkOption('#asylumSupportFromHo');
      await I.click('Save and continue');
    });

    When(/^I enter my asylum support reference number and click save and continue$/, async () => {
      I.fillField('#asylumSupportRefNumber', '123456789');
      await I.click('Save and continue');
    });
  }
};
