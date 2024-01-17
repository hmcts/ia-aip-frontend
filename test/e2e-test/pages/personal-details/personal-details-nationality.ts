import { paths } from '../../../../app/paths';
import { checkAccessibility } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  nationality(I) {
    Given('I am on the personal details nationality page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.nationality);
    });

    Then(/^I should be taken to nationality page$/, async () => {
      await I.waitInUrl(paths.appealStarted.nationality,10);
      await I.seeInCurrentUrl(paths.appealStarted.nationality);
      await checkAccessibility();
    });

    When(/^I pick "([^"]*)" from the Nationalities drop down and click continue$/, async (nation) => {
      I.wait(1);
      await I.selectOption('#nationality', nation);
      I.wait(1);
      await I.click('Save and continue');
    });

    When(/^I enter a nationality "([^"]*)"$/, async (nationality) => {
      await I.selectOption('#nationality', nationality);
    });

    Then('I should see the nationality page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.nationality);
    });
  }
};
