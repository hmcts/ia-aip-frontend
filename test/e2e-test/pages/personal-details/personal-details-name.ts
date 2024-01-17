import { paths } from '../../../../app/paths';
const config = require('config');
const { fillInDate } = require('../helper-functions');
const cache = require('memory-cache');

const testUrl = config.get('testUrl');

module.exports = {
  namePage(I) {
    Given('I am on the personal details name page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.name);
    });

    When('I go into the Personal details task', async () => {
      await I.amOnPage(testUrl + paths.appealStarted.name);
    });

    Then(/^I should be taken to the enter your name page$/, async () => {
      await I.waitInUrl(paths.appealStarted.name,10);
      await I.seeInCurrentUrl(paths.appealStarted.name);
    });

    When(/^Enter "([^"]*)" "([^"]*)" as my Given and Family Name and click Save and continue$/, async (givenName, familyName) => {
      I.waitForElement('#givenNames', 10);
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
