import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  checkAndSend(I) {

    Given(/^I am on the check your answers page$/, async () => {
      I.amOnPage(testUrl + paths.appealStarted.checkAndSend);
    });

    When(/^I click on the check and send your appeal link$/, async () => {
      await I.click('Check and send your appeal');
    });
    Then(/^I should be taken to the check-and-send page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.checkAndSend);
      await I.see('Check your answer', 'h1');
    });
    Then('I click Reason for late appeal change button', async () => {
      await I.click('(//a[contains(text(),"Change")])[9]');
    });

    When('I click send', async () => {
      await I.click('Send');
    });

    Then('I check the statement of truth', async () => {
      await I.click('I believe the information I have given is true');
    });
  }
};
