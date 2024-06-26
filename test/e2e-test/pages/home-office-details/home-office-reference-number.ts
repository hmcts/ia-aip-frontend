import { paths } from '../../../../app/paths';
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

    When(/^I go into the Home office details task$/, async () => {
      await I.amOnPage(testUrl + paths.appealStarted.details);
    });

    When(/^I click on Home office details$/, async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await I.click('#homeOfficeDetailsLink');
          await I.waitInUrl(paths.appealStarted.details, 20);
          await I.seeInCurrentUrl(paths.appealStarted.details);
          break;
        } catch (e) {
          await I.seeInCurrentUrl(paths.appealStarted.taskList);
        }
      }
      await I.seeInCurrentUrl(paths.appealStarted.details);
    });

    Then(/^I should be taken to the home office ref number page$/, async () => {
      await I.waitInUrl(paths.appealStarted.details,10);
      await I.seeInCurrentUrl(paths.appealStarted.details);
    });

    When(/^I enter "([^"]*)" as the Office ref number and click Save and continue/, async (refNumber) => {
      await I.fillField('#homeOfficeRefNumber', refNumber);
      await I.click('Save and continue');
    });
  }
};
