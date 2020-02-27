import { paths } from '../../../../app/paths';
import { fillInDate } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  dateOfBirth(I) {
    Given('I am on the personal details date of birth page', async () => {
      I.amOnPage(testUrl + paths.personalDetails.dob);
    });

    Then(/^I should be taken to the DOB page$/, async () => {
      await I.seeInCurrentUrl(paths.personalDetails.dob);
    });

    Then('I should see the date of birth page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.dob);
    });

    When(/^I enter "([^"]*)" "([^"]*)" "([^"]*)" as my DOB and click Save and continue$/, (day,month,year) => {
      fillInDate(day,month,year);
      I.click('Save and continue');
    });
  }
};
