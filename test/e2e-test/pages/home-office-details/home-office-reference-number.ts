import { paths } from '../../../../app/paths';
import { checkAccessibility } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  homeOfficeReferenceNumber(I) {
    Given('I am on the home office reference page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.details);
    });

    When(/^I enter a home office reference "([^"]*)"/, async (refNumber) => {
      I.fillField('#homeOfficeRefNumber', refNumber);
    });

    When(/^I click on Home office details$/, async () => {
      await I.click('a[href*="' + paths.appealStarted.details + '"]');
    });

    Then(/^I should be taken to the home office ref number page$/, async () => {
      await I.waitInUrl(paths.appealStarted.details,10);
      await I.seeInCurrentUrl(paths.appealStarted.details);
      await checkAccessibility();
    });

    When(/^I enter "([^"]*)" as the Office ref number and click Save and continue/, async (refNumber) => {
      await I.fillField('#homeOfficeRefNumber', refNumber);
      await I.click('Save and continue');
    });
  }
};
