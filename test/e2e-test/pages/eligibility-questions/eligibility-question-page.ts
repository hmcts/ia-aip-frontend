import { paths } from '../../../../app/paths';

const testUrl = require('config').get('testUrl');

module.exports = {
  eligibilityQuestions(I) {
    When('I select Yes and click continue', async () => {
      I.checkOption('#answer');
      I.click('Continue');
    });

    When('I select No and click continue', async () => {
      I.checkOption('#answer-2');
      I.click('Continue');
    });

    When('I go to the second eligibility question without answering the first', async () => {
      I.amOnPage(testUrl + paths.eligibility.questions + '?id=1');
    });

    Then(/^I should see the "([^"]*)" eligibility page$/, async (eligibilityQuestion) => {
      I.seeInTitle(eligibilityQuestion);
    });

    When('I click the start now button', async () => {
      I.amOnPage(paths.start);
      I.click('Start now');
    });

    When('I click the sign in and continue link', async () => {
      I.amOnPage(paths.start);
      I.click('a[id="continue"]');
    });
    Then(/^I should see "([^"]*)" questions page$/, async (startNow) => {
      I.seeInTitle(startNow);
    });

    Then(/^I should see "([^"]*)" on login page$/, async (continueAppeal) => {
      I.seeInTitle(continueAppeal);
    });
  }
};
