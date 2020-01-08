import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  enterAddress(I) {
    Given('I am on the personal details enter address page', async () => {
      I.amOnPage(testUrl + paths.personalDetails.enterAddress);
    });

    Then(/^I should be taken to the confirm address page$/, async () => {
      I.seeInCurrentUrl(paths.personalDetails.enterAddress);
    });

    When(/^I enter building and street "([^"]*)", Town or city "([^"]*)", Postcode "([^"]*)"$/, async (building, town, postcode) => {
      I.fillField('#address-line-1', building);
      I.fillField('#address-town', town);
      I.fillField('#address-postcode', postcode);
    });

    Then('I should see the enter address page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.enterAddress);
    });
  }
};
