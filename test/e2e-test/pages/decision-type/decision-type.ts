import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  decisionType(I) {

    Then(/^I should be taken to the payment page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });

    Then('I select decision type without hearing', async () => {
      await I.checkOption('#answer-2');
    });

    Then('I select decision type with hearing', async () => {
      await I.checkOption('#answer');
    });

    Then('I should see the decision type page', async () => {
      await I.seeInCurrentUrl(paths.appealStarted.decisionType);
    });

    Then('I should be taken to the payment options page', async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });
  }
};
