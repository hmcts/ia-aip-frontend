import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  paymentType(I) {
    Then(/^I should be taken to the payment page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });

    When('I select Yes for pay for the appeal now', async () => {
      I.checkOption('#answer', 'Yes');
    });
    Then('I should be taken to the payment options page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.payNow);
    });
  }
};
