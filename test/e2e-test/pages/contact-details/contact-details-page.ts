import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  contactDetails(I) {
    Given('I am on the contact details page', async () => {
      I.amOnPage(testUrl + paths.contactDetails);
    });

    When(/^I enter text message number "([^"]*)"$/, async (phoneNumber) => {
      await I.checkOption('#contactDetails-2');
      await I.fillField('#text-message-value', phoneNumber);
    });

    Then('I should see the contact details page', async () => {
      I.seeInCurrentUrl(paths.contactDetails);
    });

    When(/^I check the Text message option and type "([^"]*)" as my phone number and click Save and continue$/, async (num) => {
      await I.checkOption('Text message');
      await I.fillField('#text-message-value', num);
      await I.click('Save and continue');
    });

    Given(/^I click the contact details link$/, async () => {
      await I.click('Your contact details');
    });

    Then(/^I should be taken to the contact\-details page$/, async () => {
      await I.seeInCurrentUrl('contact-details');
    });
  }
};
