import { paths } from '../../../../app/paths';
import { fillInDate } from '../helper-functions';
import { checkAccessibility } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  oocProtectionDepartureDate(I) {
    Given('I should be taken to the Date Leave UK page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.oocProtectionDepartureDate);
      await checkAccessibility();
    });

    When(/^I enter "([^"]*)" "([^"]*)" "([^"]*)" as my Leave UK date and click Save and continue$/, (day,month,year) => {
      fillInDate(day,month,year);
      I.click('Save and continue');
    });
  }
};
