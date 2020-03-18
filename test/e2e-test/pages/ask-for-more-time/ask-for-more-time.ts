import { paths } from '../../../../app/paths';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  askForMoreTime(I) {
    Then(/^I click Ask for more time$/, async () => {
      await I.amOnPage(testUrl + paths.askForMoreTime);
    });

    Then(/^I navigate to Ask for more time page$/, async () => {
      await I.seeInCurrentUrl(paths.askForMoreTime);
    });
  }
};
