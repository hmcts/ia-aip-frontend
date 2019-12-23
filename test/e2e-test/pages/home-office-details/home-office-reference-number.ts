import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  homeOfficeReferenceNumber(I) {
    Given('I am on the home office reference page', async () => {
      I.amOnPage(testUrl + paths.homeOffice.details);
    });

    When(/^I enter a home office reference "([^"]*)"/, async (refNumber) => {
      I.fillField('#homeOfficeRefNumber', refNumber);
    });
  }
};
