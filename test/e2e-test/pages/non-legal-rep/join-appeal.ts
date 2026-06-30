import { paths } from '../../../../app/paths';
const config = require('config');
const i18n = require('../../../../locale/en.json');
const testUrl = config.get('testUrl');

module.exports = {
  joinAppeal(I) {
    Given('I click the Join appeal button', async () => {
      const joinAppealButton = locate('button.govuk-button').withText('Join appeal');
      await I.click(joinAppealButton);
    });

    Given('I should be taken to the join appeal page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.joinAppeal, 10);
    });

    Given('I should see the join appeal page content', async () => {
        await I.see(i18n.pages.joinAppeal.title, 'h1');
        await I.see(i18n.pages.joinAppeal.instructions, 'p');
        await I.see(i18n.pages.joinAppeal.partOne, 'li');
        await I.see(i18n.pages.joinAppeal.partTwo, 'li');
        await I.see(i18n.pages.joinAppeal.partThree, 'li');
        await I.see(i18n.pages.joinAppeal.instructionsPartTwo, 'p');
        await I.see(i18n.pages.joinAppeal.enterCaseReference.hintText);
        await I.see(i18n.pages.joinAppeal.enterCaseReference.label);
        await I.see(i18n.pages.joinAppeal.enterAccessCode.label);
        await I.dontSee(i18n.pages.joinAppeal.enterCaseReference.error);
        await I.dontSee(i18n.pages.joinAppeal.enterCaseReference.sameError);
        await I.dontSee(i18n.pages.joinAppeal.enterCaseReference.badNlrEmail);
        await I.dontSee(i18n.pages.joinAppeal.enterAccessCode.pinNotExistError);
        await I.dontSee(i18n.pages.joinAppeal.enterAccessCode.pinInvalidError);
        await I.dontSee(i18n.pages.joinAppeal.enterAccessCode.pinUsedError);
        await I.dontSee(i18n.pages.joinAppeal.enterAccessCode.pinExpiredError);
    });

    When(/^I fill the online-case-reference-number field with "([^"]*)"$/, async (caseReference: string) => {
      await I.fillField('#caseReference', caseReference);
    });

    When(/^I fill the access-code field with "([^"]*)"$/, async (accessCode: string) => {
      await I.fillField('#joinAppealAccessCode', accessCode);
    });


    Given('I should be taken to the join appeal confirm details page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.joinAppealConfirmDetails, 10);
    });

    Given(/^I should see the case reference number "([^"]*)" on the page$/, async (caseReference: string) => {
      await I.see(caseReference, '.govuk-summary-list__value');
    });

    Given(/^I should see the correct appeal reference on the page$/, async () => {
      await I.see('PA/12345/2026', '.govuk-summary-list__value');
    });

    Given(/^I should see the correct appellant's name on the page$/, async () => {
      await I.see('John Smith', '.govuk-summary-list__value');
    });

    Given('I should see the join appeal confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.joinAppealConfirmation, 10);
      await I.see(i18n.pages.joinAppeal.confirmation.title, 'h1');
      await I.see(i18n.pages.successPage.whatHappensNext, 'h2');
      await I.see('You have successfully joined the appeal for John Smith as a non-legal representative.', 'p');
      await I.see(i18n.pages.joinAppeal.confirmation.whatNextContent[1], 'p');
      await I.see(i18n.pages.successPage.backToCaseList);
    });
  }
};
