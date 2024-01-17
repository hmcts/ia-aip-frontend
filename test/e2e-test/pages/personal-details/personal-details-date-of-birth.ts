import { paths } from '../../../../app/paths';
import { checkAccessibility } from '../helper-functions';
import { fillInDate } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  dateOfBirth(I) {
    Given('I am on the personal details date of birth page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.dob);
    });

    Then(/^I should be taken to the DOB page$/, async () => {
      await I.waitInUrl(paths.appealStarted.dob,10);
      await I.seeInCurrentUrl(paths.appealStarted.dob);
      await checkAccessibility();
    });

    Then('I should see the date of birth page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.dob);
    });

    When(/^I enter "([^"]*)" "([^"]*)" "([^"]*)" as my DOB and click Save and continue$/, (day,month,year) => {
      I.wait(3);
      fillInDate(day,month,year);
      I.click('Save and continue');
    });
  }
};
