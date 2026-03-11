import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';
import { signInForUser } from '../helper-functions';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  casesList(I) {
    Given('I have logged in as a user with no cases', async () => {
      await I.amOnPage(testUrl + paths.common.login);
      signInForUser('no-cases@example.com');
    });

    Given('I have logged in as a user with multiple appeals', async () => {
      await I.amOnPage(testUrl + paths.common.login);
      signInForUser('multiple-appeals@example.com');
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
      await I.see(i18n.pages.casesList.createNewAppeal, 'button');
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

    Then(/^I should not see appeal reference "([^"]*)" in the table$/, async (reference: string) => {
      await I.dontSee(reference, '.govuk-table__body');
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

    When(/^I should see the confirm create appeal popup$/, async () => {
      await I.waitForVisible(`#${i18n.pages.casesList.createAppealModal.id}`, 30);
      await I.see(i18n.pages.casesList.createAppealModal.title);
      await I.see(i18n.pages.casesList.createAppealModal.description.replace('{{ maxDraftAppeals }}', 'MAX_DRAFT_APPEALS'));
      await I.see(i18n.pages.casesList.createAppealModal.confirmButton);
      await I.seeElement(`#${i18n.pages.casesList.createAppealModal.id}-cancel`);
    });

    When(/^I click cancel on the confirm create appeal popup$/, async () => {
      await I.click(`#${i18n.pages.casesList.createAppealModal.id}-cancel`);
    });

    When(/^I click confirm on the confirm create appeal popup$/, async () => {
      await I.click(`#${i18n.pages.casesList.createAppealModal.id}-confirm`);
    });

    When(/^I should see "Delete" link for appeal "([^"]*)"$/, async (reference: string) => {
      await I.see(i18n.pages.casesList.deleteLink, `//tr[contains(., "${reference}")]`);
    });

    When(/^I should not see "Delete" link for appeal "([^"]*)"$/, async (reference: string) => {
      await I.dontSee(i18n.pages.casesList.deleteLink, `//tr[contains(., "${reference}")]`);
    });

    When(/^I click "Delete" link for appeal "([^"]*)"$/, async (reference: string) => {
      await I.click(`//tr[contains(., "${reference}")]//a[contains(text(), "${i18n.pages.casesList.deleteLink}")]`);
    });

    When(/^I should see the confirm delete draft popup with case id "([^"]*)"$/, async (caseId: string) => {
      await I.waitForVisible(`#${i18n.pages.casesList.deleteDraftModal.id}`, 30);
      await I.see(i18n.pages.casesList.deleteDraftModal.title);
      await I.see(i18n.pages.casesList.deleteDraftModal.description.replace('{{ caseId }}', caseId));
      await I.see(i18n.pages.casesList.deleteDraftModal.confirmButton);
      await I.seeElement(`#${i18n.pages.casesList.deleteDraftModal.id}-cancel`);
    });

    When(/^I click confirm on the confirm delete draft popup$/, async () => {
      await I.click(`#${i18n.pages.casesList.deleteDraftModal.id}-confirm`);
    });

    When(/^I click cancel on the confirm delete draft popup$/, async () => {
      await I.click(`#${i18n.pages.casesList.deleteDraftModal.id}-cancel`);
    });

    Then(/^I should see status "([^"]*)" for appeal "([^"]*)"$/, async (status: string, reference: string) => {
      // Check that the row containing the reference also contains the status
      await I.see(status, `//tr[contains(., "${reference}")]`);
    });
  }
};
