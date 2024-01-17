import { paths } from '../../../../app/paths';
import { checkAccessibility } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  sponsorAuthorisation(I) {
    Given('I should be taken to the has sponsor authorisation page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.sponsorAuthorisation);
      await checkAccessibility();
    });
  }
};
