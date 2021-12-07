import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  paymentType(I) {

    Then(/^I should be taken to the payment page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });

    When('I select Yes for pay for the appeal now', async () => {
      await I.checkOption('#answer');
    });

    When('I select No for pay for the appeal now', async () => {
      await I.checkOption('#answer-2');
    });

    Then('I should be taken to the payment options page', async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });

    Then('I see There is a fee for this appeal page', async () => {
      await I.see('There is a fee for this appeal', 'h1');
    });

    When(/^I click on the check and send your appeal details$/, async () => {
      await I.click('Check and send your appeal details');
    });

    When('Submit and continue to pay £80 by debit or credit card', async () => {
      await I.click('Submit and continue to pay £80 by debit or credit card');
    });

    When('Submit and continue to pay £140 by debit or credit card', async () => {
      await I.click('Submit and continue to pay £140 by debit or credit card');
    });

    Then('I should be taken to the Enter card details', async () => {
      await I.see('Enter card details', 'h1');
    });

    Then('I see confirmation page', async () => {
      await I.see('You have sent your appeal details', 'h1');
    });

    Then('I see confirmation page your appeal details have been sent', async () => {
      await I.see('Your appeal details have been sent', 'h1');
    });

    Then('I enter payment details', async () => {
      await I.waitForElement('#card-no', 10);
      await I.fillField('#card-no', '4444333322221111');
      await I.fillField('#expiry-month', '06');
      await I.fillField('#expiry-year', '99');
      await I.fillField('#cardholder-name', 'Test Payment');
      await I.fillField('#cvc', '123');
      await I.fillField('#address-line-1', '1');
      await I.fillField('#address-city', 'London');
      await I.fillField('#address-postcode', 'SW1A1AA');
      await I.fillField('#email', 'test@test.com');
    });

    Then('I see Confirm your payment page', async () => {
      await I.see('Confirm your payment', 'h1');
    });

    Then(/^I click Confirm payment$/, async () => {
      await I.click('Confirm payment');
    });
  }
};
