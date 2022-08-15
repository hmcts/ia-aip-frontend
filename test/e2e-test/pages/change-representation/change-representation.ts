import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  changeRepresentation(I) {
    When(/^I click the I am no longer representing myself link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.common.changeRepresentation);
    });

    Then(/^I should see the If you are no longer representing yourself page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.common.changeRepresentation);
      await I.see('If you are no longer representing yourself', 'h1');
    });

    Then(/^I should see a Document Download button$/, async (text: string) => {
      await I.see('Document download', 'a');
    });
  }
};
