import { expect } from 'chai';
import { paths } from '../../../../app/paths';
import Logger, { getLogLabel } from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { signInForUser } from '../helper-functions';
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const config = require('config');

const testUrl = config.get('testUrl');
let caseId: string;
let deleteLink: Locator;
let numberOfAppeals: number;
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
      let hasPassed = false;
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          await I.amOnPage(testUrl + paths.common.refreshCasesList);
          await I.seeElement('.govuk-table');
          const rowCount: number = await I.grabNumberOfVisibleElements('.govuk-table__body tr');
          expect(rowCount).to.equal(parseInt(count, 10), `Expected ${count} appeals but found ${rowCount}`);
          hasPassed = true;
          break;
        } catch (error) {
          logger.exception(error, logLabel);
          logger.trace(`Failed attempt ${attempt + 1}. Refreshing case list and trying again...`, logLabel);
          await I.wait(1);
        }
      }
      expect(hasPassed).to.equal(true, `Failed to see the expected number of appeals after ${maxAttempts} attempts.`);
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

    When(/^I should see the confirm delete draft popup with case id "([^"]*)"$/, async (someCaseId: string) => {
      await I.waitForVisible(`#${i18n.pages.casesList.deleteDraftModal.id}`, 30);
      await I.see(i18n.pages.casesList.deleteDraftModal.title);
      await I.see(i18n.pages.casesList.deleteDraftModal.description.replace('{{ caseId }}', someCaseId));
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

    When('I click the "Back to cases list" link', async () => {
      await I.click(i18n.components.back.backToCasesList);
    });

    When(/^I create a new draft appeal "([0-9]*)" times$/, async (times: string) => {
      const count = parseInt(times);
      for (let i = 0; i < count; i++) {
        await I.amOnPage(testUrl + paths.common.createNewAppeal);
        await I.waitInUrl(paths.common.overview, 30);
      }
    });

    When('I create a new draft appeal', async () => {
      await I.click(i18n.pages.casesList.createNewAppeal);
      await I.waitForVisible(`#${i18n.pages.casesList.createAppealModal.id}-confirm`, 30);
      await I.click(`#${i18n.pages.casesList.createAppealModal.id}-confirm`);
    });

    When(/^I should see the case list with the "([^"]*)" error$/, async (errorCode: string) => {
      await I.waitInUrl(`${paths.common.casesList}?errorCode=${errorCode}`, 30);
      await I.seeInCurrentUrl(`${paths.common.casesList}?errorCode=${errorCode}`);
      await I.see(i18n.pages.casesList[`${errorCode}Error`].replace('{{ caseId }}', caseId));
    });

    When('I grab a draft appeal at random', async () => {
      const rowCount: number = await I.grabNumberOfVisibleElements('.govuk-table__body tr');
      numberOfAppeals = rowCount;
      const randomIndex = Math.floor(Math.random() * rowCount);
      const randomRow: Locator = locate('tbody .govuk-table__row').at(randomIndex);
      caseId = await I.grabValueFrom(randomRow.find('td').at(1));
      deleteLink = randomRow.find('a').withText(i18n.pages.casesList.deleteLink);
    });

    When('I click "Delete" link for the grabbed appeal', async () => {
      await I.click(deleteLink);
    });

    When('I should see the confirm delete draft popup with case id matching the grabbed appeal', async () => {
      await I.waitForVisible(`#${i18n.pages.casesList.deleteDraftModal.id}`, 30);
      await I.see(i18n.pages.casesList.deleteDraftModal.title);
      await I.see(i18n.pages.casesList.deleteDraftModal.description.replace('{{ caseId }}', caseId));
      await I.see(i18n.pages.casesList.deleteDraftModal.confirmButton);
      await I.seeElement(`#${i18n.pages.casesList.deleteDraftModal.id}-cancel`);
    });

    When('I should not see the grabbed appeal in the table', async () => {
      const rowCount: number = await I.grabNumberOfVisibleElements('.govuk-table__body tr');
      expect(rowCount).to.equal(numberOfAppeals - 1);
      numberOfAppeals = rowCount;
      await I.dontSee(caseId, '.govuk-table__body');
    });

    When('I go to view the grabbed appeal', async () => {
      await I.amOnPage(`${testUrl}${paths.common.overview}?caseId=${caseId}`);
    });
  }
};
