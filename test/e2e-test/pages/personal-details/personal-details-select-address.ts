import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  selectAddress(I) {
    Then('I should see the select address page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.postcodeLookup);
    });

    Then(/^I should be taken to the what is your address page$/, async () => {
      I.seeInCurrentUrl('postcode-lookup');
    });

    When(/^I choose the first address from the dropdown list and click continue$/, async () => {
      await I.selectOption('#address', '52526732');
      I.click('Save and continue');
    });
  }
};
