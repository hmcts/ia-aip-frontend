import { paths } from '../../../../app/paths';

const testUrl = require('config').get('testUrl');

module.exports = {
  eligibilityQuestions(I) {
    When('I select Yes and click continue', async () => {
      await I.checkOption('#answer');
      await I.click('Continue');
    });
    When('I select I want the appeal to be decided without a hearing and click continue', async () => {
      await I.checkOption('#answer-2');
    });

    When('I select No and click continue', async () => {
      await I.checkOption('#answer-2');
      await I.click('Continue');
    });
    When('I select No, I will pay later and click continue', async () => {
      await I.checkOption('#answer-2');
    });

    When('I go to the second eligibility question without answering the first', async () => {
      await I.amOnPage(testUrl + paths.common.questions + '?id=1');
    });

    Then(/^I should see the "([^"]*)" eligibility page$/, async (eligibilityQuestion) => {
      await I.seeInTitle(eligibilityQuestion);
    });
  }
};
