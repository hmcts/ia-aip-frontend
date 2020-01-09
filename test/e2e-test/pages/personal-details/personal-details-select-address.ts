import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  selectAddress(I) {
    Then('I should see the select address page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.postcodeLookup);
    });
  }
};
