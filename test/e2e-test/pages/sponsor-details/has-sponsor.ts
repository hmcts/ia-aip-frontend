import { paths } from '../../../../app/paths';
import { checkAccessibility } from '../helper-functions';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  hasSponsor(I) {
    Given('I should be taken to the has sponsor page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.hasSponsor);
      await checkAccessibility();
    });
  }
};
