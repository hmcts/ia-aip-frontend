import { paths } from '../../../../app/paths';
const config = require('config');
const { fillInDate } = require('../helper-functions');

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
      await I.waitInUrl(paths.appealStarted.letterSent,10);
      await I.seeInCurrentUrl(paths.appealStarted.letterSent);
    });

    Then(/^I should see letter received page$/, async () => {
      await I.waitInUrl(paths.appealStarted.letterReceived,10);
      await I.seeInCurrentUrl(paths.appealStarted.letterReceived);
    });

    When(/^I enter an on time letter sent date$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
    });

    When(/^I enter an on time letter received date$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear());
    });

    When(/^I enter an out of time letter sent date and click Save and continue$/, async () => {
      const date = new Date();
      await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear() - 1);
      I.click('Save and continue');
    });

    When('I visit a non-existent document', async () => {
      I.amOnPage(testUrl + '/view/document/fileID');
    });

    When('I upload a Home Office decision letter', async () => {
      await I.attachFile("input[type='file']", `/test/files/valid-image-file.png`);
      I.click('Upload file');
    });

    Then('I should see the no file found page', async () => {
      I.seeInCurrentUrl(paths.common.fileNotFound);
    });
  }
};
