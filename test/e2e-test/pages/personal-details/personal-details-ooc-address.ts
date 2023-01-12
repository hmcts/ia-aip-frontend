import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  oocAddress(I) {
    Given('I am on the out of country address page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.oocAddress);
    });

    Then(/^I should be taken to the out of country address page$/, async () => {
      await I.waitInUrl(paths.appealStarted.oocAddress,10);
      await I.seeInCurrentUrl(paths.appealStarted.oocAddress);
    });

    When(/^I enter an out of country address of "([^"]*)"$/, async (oocAddress) => {
      I.fillField('#outofcountry-address', oocAddress);
    });
  }
};
