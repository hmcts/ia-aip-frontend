import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  feeSupport(I) {
    Given('I am on the fee support page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.feeSupport);
    });

    When(/^I click on the Support to pay the fee page$/, async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await I.click('#feeSupportLink');
          await I.waitInUrl(paths.appealStarted.feeSupport, 20);
          await I.seeInCurrentUrl(paths.appealStarted.feeSupport);
          break;
        } catch (e) {
          await I.seeInCurrentUrl(paths.appealStarted.taskList);
        }
      }
      await I.seeInCurrentUrl(paths.appealStarted.feeSupport);
    });

    When(/^I click on support to pay the fee link and it takes me to the asylum support page$/, async () => {
      await I.click('#feeSupportLink');
      await I.seeInCurrentUrl(paths.appealStarted.asylumSupport);
    });

    Then(/^I go to the support to pay the fee page$/, async () => {
      await I.waitInUrl(paths.appealStarted.feeSupport,20);
      await I.seeInCurrentUrl(paths.appealStarted.feeSupport);
    });

    When(/^I choose Asylum support and click save and continue$/, async () => {
      await I.checkOption('#asylumSupportFromHo');
      await I.click('Save and continue');
    });

    When(/^I choose None of these statements and click save and continue$/, async () => {
      await I.checkOption('#noneOfTheseStatements');
      await I.click('Save and continue');
    });

    When(/^I enter my asylum support reference number and click save and continue$/, async () => {
      await I.waitInUrl(paths.appealStarted.asylumSupport,20);
      I.fillField('#asylumSupportRefNumber', '123456789');
      await I.click('Save and continue');
    });
  }
};
