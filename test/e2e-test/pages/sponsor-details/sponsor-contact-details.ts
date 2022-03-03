import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  sponsorContactDetails(I) {
    Given('I should be taken to the sponsor contact details page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.sponsorContactDetails);
    });

    When(/^I enter sponsor email "([^"]*)"$/, async (sponsorEmail) => {
      await I.checkOption('#sponsorContactDetails');
      await I.fillField('#email-value', sponsorEmail);
    });

    When(/^I enter sponsor mobile number "([^"]*)"$/, async (sponsorPhoneNumber) => {
      await I.checkOption('#sponsorContactDetails-2');
      await I.fillField('#text-message-value', sponsorPhoneNumber);
    });

    Then(/^I check the "([^"]*)" option$/, async (option) => {
      await I.checkOption(option);
    });
  }
};
