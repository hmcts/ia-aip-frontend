import { paths } from '../../../../app/paths';
const config = require('config');
const { fillInDate } = require('../helper-functions');
const cache = require('memory-cache');

const testUrl = config.get('testUrl');

module.exports = {
  namePage(I) {
    Given('I am on the personal details name page', async () => {
      I.amOnPage(testUrl + paths.personalDetails.name);
    });

    Then(/^I should be taken to the enter your name page$/, async () => {
      await I.seeInCurrentUrl(paths.personalDetails.name);
    });

    When(/^Enter "([^"]*)" "([^"]*)" as my Given and Family Name and click Save and continue$/, async (givenName, familyName) => {
      I.fillField('#givenNames',givenName);
      I.fillField('#familyName',familyName);
      I.click('Save and continue');
    });

    When(/^I enter given name "([^"]*)" family name "([^"]*)"$/, async (givenName, familyName) => {
      I.fillField('#givenNames',givenName);
      I.fillField('#familyName',familyName);
    });

  }
};
