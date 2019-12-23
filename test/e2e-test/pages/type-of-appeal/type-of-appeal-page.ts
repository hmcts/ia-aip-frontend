import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  typeOfAppealPage(I) {
    Given('I am on the type of appeal page', async () => {
      I.amOnPage(testUrl + paths.typeOfAppeal);
    });

    When('I select appeal type Protection', async () => {
      I.checkOption('#appealType');
    });

    Then('I should see the type of appeal page', async () => {
      I.seeInCurrentUrl(paths.typeOfAppeal);
    });
  }
};
