import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  typeOfAppeal(I) {
    When(/^I click on the type-of-appeal link$/, async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await I.click('a[href*="' + paths.appealStarted.appealOutOfCountry + '"]');
          await I.waitInUrl(paths.appealStarted.appealOutOfCountry, 20);
          await I.seeInCurrentUrl(paths.appealStarted.appealOutOfCountry);
          break;
        } catch (e) {
          await I.seeInCurrentUrl(paths.appealStarted.taskList);
        }
      }
      await I.seeInCurrentUrl(paths.appealStarted.appealOutOfCountry);
    });
    When(/^I go into the Appeal type task$/, async () => {
      await I.amOnPage(testUrl + paths.appealStarted.appealOutOfCountry);
    });
    Then(/^I should be taken to the Is the appellant in the UK page$/, async () => {
      await I.waitInUrl(paths.appealStarted.appealOutOfCountry,20);
      await I.seeInCurrentUrl(paths.appealStarted.appealOutOfCountry);
    });
    When(/^I select Yes$/, async () => {
      await I.click('Yes');
    });
    Then(/^I should be taken to the appeal page$/, async () => {
      await I.waitInUrl(paths.appealStarted.typeOfAppeal,10);
      await I.seeInCurrentUrl(paths.appealStarted.typeOfAppeal);
    });
    Then(/^I should be taken to the currently living in the United Kingdom page$/, async () => {
      await I.waitInUrl(paths.appealStarted.appealOutOfCountry,10);
      await I.seeInCurrentUrl(paths.appealStarted.appealOutOfCountry);
    });
    When(/^I click on Protection as my type of appeal and click Save and continue$/, async () => {
      await I.checkOption('#appealType');
      await I.click('Save and continue');
    });

    Given('I am on the type of appeal page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.typeOfAppeal);
    });

    Given('I am on the access needs page', async () => {
      I.amOnPage(testUrl + paths.awaitingCmaRequirements.accessNeeds);
    });

    Given('I am on the online support page', async () => {
      I.amOnPage(testUrl + paths.common.whatIsIt);
    });

    When('I select appeal type Protection', async () => {
      I.checkOption('#appealType');
    });

    When('I select appeal type Human Rights', async () => {
      I.checkOption('#appealType-3');
    });

    When('I select appeal type European Economic Area', async () => {
      I.checkOption('#appealType-5');
    });

    When('I select appeal type Revocation of Protection Status', async () => {
      I.checkOption('#appealType-7');
    });

    When('I select appeal type Deprivation of Citizenship', async () => {
      I.checkOption('#appealType-9');
    });

    When('I select appeal type EU Settlement Scheme', async () => {
      I.checkOption('#appealType-11');
    });

    Then('I should see the type of appeal page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.typeOfAppeal);
    });
  }
};
