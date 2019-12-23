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
  }
};
