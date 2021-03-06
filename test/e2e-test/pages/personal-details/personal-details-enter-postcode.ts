import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  enterPostcode(I) {
    Given('I am on the personal details enter postcode page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.enterPostcode);
    });

    Then(/^I should be taken to the enter your postcode page$/, async () => {
      I.seeInCurrentUrl(paths.appealStarted.enterPostcode);
    });

    When(/^I type "([^"]*)" as my postcode and click Find address$/, async (postcode) => {
      I.fillField('#postcode',postcode);
      I.click('Find address');
    });

    When('I click find address', async () => {
      I.click({ name: 'findAddress' });
    });

    When(/^I enter a postcode "([^"]*)"$/, async (postcode) => {
      I.fillField('#postcode', postcode);
    });

    Then('I should see the enter postcode page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.enterPostcode);
    });
  }
};
