import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  deportationOrder(I) {
    Given('I am on the deportation order page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.deportationOrder);
    });

    Then(/^I should see the deportation order page$/, async () => {
      await I.waitInUrl(paths.appealStarted.deportationOrder,20);
      await I.seeInCurrentUrl(paths.appealStarted.deportationOrder);
    });

    When('I choose Yes and click save and continue', async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    When('I choose No and click save and continue', async () => {
      await I.checkOption('#answer-2');
      await I.click('Save and continue');
    });
  }
};
