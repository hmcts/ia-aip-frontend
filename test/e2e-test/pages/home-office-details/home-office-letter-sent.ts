import { paths } from '../../../../app/paths';
const config = require('config');
const { fillInDate } = require('../helper-functions');

const testUrl = config.get('testUrl');

module.exports = {
  homeOfficeLetterSent(I) {
    Given('I am on the home office letter sent page', async () => {
      // I.amOnPage(testUrl + paths.homeOffice.letterSent);

      await I.amOnPage(testUrl + paths.homeOffice.details);
      await I.fillField('#homeOfficeRefNumber', 'A123456');
      await I.click('Save and continue');
    });

    When(/^I enter a day "([^"]*)" month "([^"]*)" year "([^"]*)"$/, async (day, month, year) => {
      await fillInDate(day, month, year);
    });

    When(/^I enter a a home letter date in the last 2 weeks$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
    });
  }
};
