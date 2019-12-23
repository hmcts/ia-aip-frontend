const { signInHelper } = require('./helper-functions');
import { paths } from '../../../app/paths';
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

    Then('I shouldnt be able to click Personal details', async () => {
      await I.seeInSource('Your personal details');
      await I.dontSeeElement('#personalDetailsLink');
    });

    Then('I should be able to click Personal details', async () => {
      await I.seeElement('#personalDetailsLink');
    });

    Given('I am authenticated as a valid appellant', async () => {
      I.amOnPage(testUrl);
      await I.click('.govuk-button');
      await I.seeInTitle('Sign in - HMCTS Access');
      await signInHelper();
      await I.seeInTitle('Task List - Immigration & Asylum - GOV.UK');
    });

    Given('I am authenticated as a valid appellant and on the home office reference page', async () => {
      I.amOnPage(testUrl);
      await I.click('.govuk-button');
      await I.seeInTitle('Sign in - HMCTS Access');
      await signInHelper();
      await I.seeInTitle('Task List - Immigration & Asylum - GOV.UK');
      await I.click('a[href*="/home-office"]');
    });

    Given('I am authenticated as a valid appellant and on the home office letter sent page', async () => {
      I.amOnPage(testUrl);
      await I.click('.govuk-button');
      await I.seeInTitle('Sign in - HMCTS Access');
      await signInHelper();
      await I.seeInTitle('Task List - Immigration & Asylum - GOV.UK');

      await I.amOnPage(testUrl + paths.homeOffice.details);
      await I.fillField('#homeOfficeRefNumber', 'A123456');
      await I.click('Save and continue');

      // await I.amOnPage(testUrl + paths.homeOffice.letterSent);
    });

    Given('I am on the home office reference page', async () => {
      I.amOnPage(testUrl + paths.homeOffice.details);
    });

    Given('I am on the home office letter sent page', async () => {
      I.amOnPage(testUrl + paths.homeOffice.letterSent);
    });

    When('I click save for later',async () => {
      await I.click('Save for later');
    });

    When('I click save and continue',async () => {
      await I.click('Save and continue');
    });
  }
};
