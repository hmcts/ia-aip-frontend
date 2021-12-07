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

    When(/^I click on the check and send your appeal details$/, async () => {
      await I.click('Check and send your appeal details');
    });

    When('Submit and continue to pay by debit or credit card', async () => {
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
  }
};
