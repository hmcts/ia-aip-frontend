import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  sponsorAuthorisation(I) {
    Given('I should be taken to the has sponsor authorisation page', async () => {
      I.waitInUrl(testUrl + paths.appealStarted.sponsorAuthorisation, 10);
    });

    Given('I go to the has sponsor authorisation page', async () => {
      await I.amOnPage(testUrl + paths.appealStarted.sponsorAuthorisation);
    });
  }
};
