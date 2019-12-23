import { paths } from '../../../../app/paths';

module.exports = {
  dateOfBirth(I) {
    Given('I am on the personal details date of birth page', async () => {
      I.amOnPage(testUrl + paths.personalDetails.dob);
    });

    Then('I should see the date of birth page', async () => {
      I.seeInCurrentUrl(paths.personalDetails.dob);
    });
  }
};
