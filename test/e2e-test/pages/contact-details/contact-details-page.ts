import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  contactDetails(I) {
    Given('I am on the contact details page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.contactDetails);
    });

    When(/^I enter email "([^"]*)"$/, async (email) => {
      await I.checkOption('#contactDetails');
      await I.fillField('#email-value', email);
    });

    When(/^I enter text message number "([^"]*)"$/, async (phoneNumber) => {
      await I.checkOption('#contactDetails-2');
      await I.fillField('#text-message-value', phoneNumber);
    });

    Then(/^I check the "([^"]*)" option$/, async (option) => {
      await I.checkOption(option);
    });

    Then('I should see the contact details page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.contactDetails);
    });

    Given(/^I click the contact details link$/, async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await I.click('#contactDetailsLink');
          await I.waitInUrl(paths.appealStarted.contactDetails, 20);
          await I.seeInCurrentUrl(paths.appealStarted.contactDetails);
          break;
        } catch (e) {
          await I.seeInCurrentUrl(paths.appealStarted.taskList);
        }
      }
      await I.seeInCurrentUrl(paths.appealStarted.contactDetails);
    });

    Then(/^I should be taken to the contact\-details page$/, async () => {
      await I.waitInUrl(paths.appealStarted.contactDetails,10);
      await I.seeInCurrentUrl(paths.appealStarted.contactDetails);
    });

    When('I go into the Contact details task', async () => {
      await I.amOnPage(testUrl + paths.appealStarted.contactDetails);
    });
  }
};
