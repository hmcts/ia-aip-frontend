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

    When(/^I Enter a phone number "([^"]*)"$/, async (phoneNumber) => {
      I.wait(5);
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
      await I.click('Your contact details');
    });

    Then(/^I should be taken to the contact\-details page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.contactDetails);
    });
  }
};
