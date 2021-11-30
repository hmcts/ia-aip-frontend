import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  decisionType(I) {
    Then(/^I should be taken to the payment page$/, async () => {
      await I.seeInCurrentUrl(paths.appealStarted.payNow);
    });
    // When(/^I click on Protection as my type of appeal and click Save and continue$/, async () => {
    //   await I.checkOption('Protection');
    //   await I.click('Save and continue');
    // });
    When('I select decision type with hearing', async () => {
      I.checkOption('#answer', 'I want the appeal to be decided with a hearing');
    });

    When('I select decision type with hearing', async () => {
      I.checkOption('#answer', 'I want the appeal to be decided with a hearing');
    });

    Then('I should see the decision type page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.decisionType);
    });
    Then('I should be taken to the payment options page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.payNow);
    });
  }
};
