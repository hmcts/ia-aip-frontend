import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  enterPostcode(I) {
    Given('I am on the personal details enter postcode page', async () => {
      I.amOnPage(testUrl + paths.personalDetails.enterPostcode);
    });

    Then('I should see the enter postcode page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.enterPostcode);
    });
  }
};
