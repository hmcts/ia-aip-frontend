import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  cmaRequirements(I) {

    Then(/^I should see the cma requirements task-list page$/, async () => {
      await I.seeInCurrentUrl(paths.awaitingCmaRequirements.taskList);
      await I.see('Tell us your appointment needs', 'h1');
    });

    When('I choose Yes and click save and continue', async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    When('I choose No and click save and continue', async () => {
      await I.checkOption('#answer-2');
      await I.click('Save and continue');
    });
  }
};
