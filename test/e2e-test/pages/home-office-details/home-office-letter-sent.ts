import { paths } from '../../../../app/paths';
const config = require('config');
const { fillInDate } = require('../helper-functions');
const cache = require('memory-cache');

const testUrl = config.get('testUrl');

module.exports = {
  homeOfficeLetterSent(I) {
    Given('I am on the home office letter sent page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.letterSent);
    });

    When(/^I enter a a home letter date in the last 2 weeks$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
    });

    Then(/^I should see letter sent page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.letterSent);
    });

    When(/^I enter an on time letter sent date$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
    });

    When(/^I enter an out of time letter sent date and click Save and continue$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear() - 1);
      I.click('Save and continue');
    });
  }
};
