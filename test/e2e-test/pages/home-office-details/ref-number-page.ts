const { fillInDate } = require('../helper-functions');

const { enterRefNumber } = require('../helper-functions');

module.exports = {
  fillInHomeOfficeDetails(I) {
    When(/^I click on Home office details$/, async () => {
      await I.click('a[href*="/home-office"]');
    });

    Then(/^I should be taken to the home office ref number page$/, async () => {
      await I.seeInCurrentUrl('/home-office/details');
    });

    When(/^I enter "([^"]*)" and click Save and Continue/, async (refNumber) => {
      enterRefNumber(refNumber);
    });

    When(/^I enter a home office reference "([^"]*)"/, async (refNumber) => {
      await I.fillField('#homeOfficeRefNumber', refNumber);
    });

    Then(/^I should see letter sent page$/, async () => {
      await I.seeInCurrentUrl('/letter-sent');
    });

    When(/^I enter a date before expiry$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
      I.click('.govuk-button');
    });

    When(/^I enter a day "([^"]*)" month "([^"]*)" year "([^"]*)"$/, async (day, month, year) => {
      await fillInDate(day, month, year);
    });

    When(/^I enter a a home letter date in the last 2 weeks$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
    });

    Then(/^I expect to be redirect back to the task\-list$/, async () => {
      await I.seeInCurrentUrl('/task-list');
    });
  }
};
