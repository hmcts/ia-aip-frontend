import { paths } from '../../../../app/paths';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  startRepresentingYourself(I) {
    When(/^I visit the start-representing-yourself page$/, async () => {
      await I.amOnPage(testUrl + paths.startRepresentingYourself.start);
    });
  }
};
