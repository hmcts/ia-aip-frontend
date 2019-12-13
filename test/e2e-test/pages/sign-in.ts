const { signInHelper } = require('./helper-functions');
const testUrl = require('config').get('testUrl');

module.exports = {
  signIn(I) {
    Given('I am on home page', () => {
      I.amOnPage(testUrl);
    });

    When('I click start now', async () => {
      await I.click('.govuk-button');
    });

    Then('I should see the sign in page', async () => {
      await I.seeInTitle('Sign in - HMCTS Access');
    });

    When('I enter creds and click sign in',async () => {
      await signInHelper();
    });

    Then('I should see the task-list page', async () => {
      await I.seeInCurrentUrl('task-list');
    });

    Given('I am authenticated as a valid appellant', async () => {
      I.amOnPage(testUrl);
      await I.click('.govuk-button');
      await I.seeInTitle('Sign in - HMCTS Access');
      await signInHelper();
      await I.seeInTitle('Task List - Immigration & Asylum - GOV.UK');
    });
  }
};
