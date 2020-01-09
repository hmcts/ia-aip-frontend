import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  nationality(I) {
    Given('I am on the personal details nationality page', async () => {
      I.amOnPage(testUrl + paths.personalDetails.nationality);
    });

    When(/^I enter a nationality "([^"]*)"$/, async (nationality) => {
      await I.selectOption('#nationality', nationality);
    });

    Then('I should see the nationality page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.nationality);
    });
  }
};
