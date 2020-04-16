import { paths } from '../../../../app/paths';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  askForMoreTime(I) {
    Then(/^I click Ask for more time$/, async () => {
      await I.amOnPage(testUrl + paths.askForMoreTime.reason);
    });

    Then(/^I should see the ask-for-more-time page$/, async () => {
      await I.seeInCurrentUrl(paths.askForMoreTime.reason);
    });

    Then(/^I should see do you want to upload evidence page$/, async () => {
      I.amOnPage(testUrl + paths.askForMoreTime.evidenceYesNo);
      I.seeInTitle('Do you want to provide supporting evidence for why you need more time?');
    });

    Then(/^I should see the ask for more time check you answers page$/, async () => {
      I.amOnPage(testUrl + paths.askForMoreTime.checkAndSend);
      I.seeInTitle('Check your answer');
    });

    Then(/^I should see the reasons for appeal$/, async () => {
      I.seeInSource('Reason for time extension');
    });

    Then(/^I should see uploaded evidence$/, async () => {
      I.seeInSource('valid-image-file.png');
    });

    Then(/^I am on the evidence upload page$/, async () => {
      I.amOnPage(testUrl + paths.askForMoreTime.supportingEvidenceUpload);
      I.seeInTitle('Provide supporting evidence');
    });

    When(/^I enter a time extensions reason$/, async () => {
      await I.fillField('#askForMoreTime', 'Reason for time extension');
    });

    When(/^I click save and continue$/, async () => {
      await I.click('Save and continue');
    });
  }
};
