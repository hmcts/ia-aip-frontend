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
      I.amOnPage(testUrl + paths.common.questions + '?id=1');
    });

    Then(/^I should see the "([^"]*)" eligibility page$/, async (eligibilityQuestion) => {
      I.seeInTitle(eligibilityQuestion);
    });
  }
};
