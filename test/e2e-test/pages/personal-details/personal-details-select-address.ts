import { paths } from '../../../../app/paths';
import { checkAccessibility } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  selectAddress(I) {
    Then('I should see the select address page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.postcodeLookup);
    });

    Then(/^I should be taken to the what is your address page$/, async () => {
      I.seeInCurrentUrl(paths.appealStarted.postcodeLookup);
      await checkAccessibility();
    });

    When(/^I choose the first address from the dropdown list and click continue$/, async () => {
      I.waitForElement('#address', 10);
      await I.selectOption('#address', '52526732');
      I.click('Save and continue');
    });
  }
};
