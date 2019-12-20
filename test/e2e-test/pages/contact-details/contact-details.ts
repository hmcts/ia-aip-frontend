module.exports = {
  fillInContactDetails(I) {
    Given(/^I click the contact details link$/, async () => {
      await I.click('Your contact details');
    });
    Then(/^I should be taken to the contact\-details page$/, async () => {
      await I.seeInCurrentUrl('contact-details');
    });
    When(/^I check the Text message option and type "([^"]*)" as my phone number and click Save and continue$/, async (num) => {
      await I.checkOption('Text message');
      await I.fillField('#text-message-value', num);
      await I.click('Save and continue');
    });
    Then(/^I should be taken to the task\-list page$/, async () => {
      await I.seeInCurrentUrl('task-list');
    });
  }
};
