import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  casesList(I) {
    Given('I have logged in as a user with no cases', async () => {
      await I.amOnPage(testUrl + paths.common.login);
      await I.fillField('#username', 'no-cases@example.com');
      await I.fillField('#password', 'Apassword123');
      await I.click('Sign in');
      await I.waitInUrl(paths.common.casesList, 30);
    });

    Given('I have logged in as a user with multiple appeals', async () => {
      await I.amOnPage(testUrl + paths.common.login);
      await I.fillField('#username', 'multiple-appeals@example.com');
      await I.fillField('#password', 'Apassword123');
      await I.click('Sign in');
      await I.waitInUrl(paths.common.casesList, 30);
    });

    When('I visit the cases list page', async () => {
      await I.amOnPage(testUrl + paths.common.casesList);
    });

    Then('I should see the cases list page', async () => {
      await I.waitInUrl(paths.common.casesList, 10);
      await I.seeInCurrentUrl(paths.common.casesList);
      await I.see(i18n.pages.casesList.title, 'h1');
    });

    Then(/^I should see "You do not have any appeals." message$/, async () => {
      await I.see(i18n.pages.casesList.noCases);
    });

    Then(/^I should see "Create a new appeal" link$/, async () => {
      await I.see(i18n.pages.casesList.createNewAppeal, 'a');
    });

    Then(/^I should see a table with (\d+) appeals?$/, async (count: string) => {
      await I.seeElement('.govuk-table');
      const rowCount = await I.grabNumberOfVisibleElements('.govuk-table__body tr');
      if (rowCount !== parseInt(count, 10)) {
        throw new Error(`Expected ${count} appeals but found ${rowCount}`);
      }
    });

    Then(/^I should see "View" link for the appeal$/, async () => {
      await I.see(i18n.pages.casesList.viewLink, '.govuk-table__body a');
    });

    Then(/^I should see appeal reference "([^"]*)" in the table$/, async (reference: string) => {
      await I.see(reference, '.govuk-table__body');
    });

    When(/^I click "View" link for appeal "([^"]*)"$/, async (reference: string) => {
      // Find the row with the appeal reference and click its View link
      await I.click(`//tr[contains(., "${reference}")]//a[contains(text(), "${i18n.pages.casesList.viewLink}")]`);
      await I.waitInUrl(paths.common.overview, 30);
    });

    When(/^I click "Create a new appeal" link$/, async () => {
      await I.click(i18n.pages.casesList.createNewAppeal);
      await I.waitInUrl(paths.common.overview, 30);
    });

    Then(/^I should see status "([^"]*)" for appeal "([^"]*)"$/, async (status: string, reference: string) => {
      // Check that the row containing the reference also contains the status
      await I.see(status, `//tr[contains(., "${reference}")]`);
    });
  }
};
