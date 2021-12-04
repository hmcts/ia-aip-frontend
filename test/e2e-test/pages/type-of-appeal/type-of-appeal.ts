import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  typeOfAppeal(I) {
    When(/^I click on the type\-of\-appeal link$/, async () => {
      await I.click('Type of appeal');
    });
    Then(/^I should be taken to the appeal page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.typeOfAppeal);
    });
    When(/^I click on Protection as my type of appeal and click Save and continue$/, async () => {
      await I.checkOption('Protection');
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
      await I.checkOption('#appealType-2');
    });

    When('I select appeal type European Economic Area', async () => {
      await I.checkOption('#appealType-3');
    });

    Then('I should see the type of appeal page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.typeOfAppeal);
    });
  }
};
