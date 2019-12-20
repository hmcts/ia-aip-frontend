import { fillInDate } from '../helper-functions';

module.exports = {
  fillInPersonalDetails(I) {
    When(/^I click Your personal details$/, async () => {
      // await I.click('a[href*="/personal-details"]');
      await I.click('Your personal details');
    });
    Then(/^I should be taken to the enter your name page$/, async () => {
      await I.seeInCurrentUrl('details/name');
    });

    When(/^Enter "([^"]*)" "([^"]*)" as my Given and Family Name and click Save and continue$/, async (givenName, familyName) => {
      I.fillField('#givenNames',givenName);
      I.fillField('#familyName',familyName);
      I.click('Save and continue');
    });
    Then(/^click save and continue$/, async () => {
      I.click('Save and continue');
    });
    Then(/^I should be taken to the DOB page$/, async () => {
      await I.seeInCurrentUrl('details/date-of-birth');
    });
    When(/^I enter "([^"]*)" "([^"]*)" "([^"]*)" as my DOB and click Save and continue$/, (day,month,year) => {
      fillInDate(day,month,year);
      I.click('Save and continue');

    });
    Then(/^I should be taken to nationality page$/, async () => {
      await I.seeInCurrentUrl('details/nationality');
    });
    When(/^I pick "([^"]*)" from the Nationalities drop down and click continue$/, async (nation) => {
      await I.selectOption('#nationality', nation);
      await I.click('Save and continue');
    });
    Then(/^I should be taken to the enter your postcode page$/, async () => {
      I.seeInCurrentUrl('details/enter-postcode');
    });
    When(/^I type "([^"]*)" as my postcode and click Find address$/, async (postcode) => {
      I.fillField('#postcode',postcode);
      I.click('Find address');
    });
    Then(/^I should be taken to the what is your address page$/, async () => {
      I.seeInCurrentUrl('postcode-lookup');
    });
    When(/^I choose the first address from the dropdown list and click continue$/, async () => {
      await I.selectOption('#address', '52526732');
      I.click('Save and continue');
    });
    Then(/^I should be taken to the confirm address page$/, async () => {
      I.seeInCurrentUrl('details/enter-address');
    });
    When(/^I confirm my address and click Save and continue$/, async () => {
      I.click('Save and continue');
    });
    Then(/^I should be taken to the task\-list$/, async () => {
      await I.seeInCurrentUrl('task-list');
    });
  }
};
