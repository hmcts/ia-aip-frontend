import { paths } from '../../../../app/paths';
const config = require('config');
const { fillInDate } = require('../helper-functions');
const cache = require('memory-cache');

const testUrl = config.get('testUrl');

module.exports = {
  sponsorName(I) {
    Given('I should be taken to the has sponsor name page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.sponsorName);
    });

    When(/^I enter "([^"]*)" "([^"]*)" as my sponsor's Given and Family Name and click Save and continue$/, async (sponsorGivenNames, sponsorFamilyName) => {
      I.waitForElement('#sponsorGivenNames', 10);
      I.fillField('#sponsorGivenNames',sponsorGivenNames);
      I.fillField('#sponsorFamilyName',sponsorFamilyName);
      I.click('Save and continue');
    });
  }
};
