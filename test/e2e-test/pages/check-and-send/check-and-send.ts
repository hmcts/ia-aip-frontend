import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');
const street = '60 GREAT PORTLAND STREET';
const town = 'LONDON';
const postcode = 'W1W 7RT';

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
      await I.click('(//a[contains(text(),"Change")])[10]');
    });

    When('I click send', async () => {
      await I.click('Send');
    });
    Then(/^I should be taken to the payment page$/, async () => {
      await I.see('Enter card details', 'h1');
    });

    Then('I check the statement of truth', async () => {
      await I.click('I believe the information I have given is true');
    });
    When(/^I enter successful card details and confirm payment$/, async () => {
      await I.waitForElement('#card-no', 10);
      await I.fillField('#card-no','4444333322221111');
      await I.fillField('#expiry-month','10');
      await I.fillField('#expiry-year','23');
      await I.fillField('#cardholder-name','Successful payment');
      await I.fillField('#cvc','123');
      await I.fillField('#address-line-1',street);
      await I.fillField('#address-city',town);
      await I.fillField('#address-postcode',postcode);
      await I.fillField('#email','testPayment@gmail.com');
      await I.click('Continue');
      await I.click('Confirm payment');
    });
  }
};
