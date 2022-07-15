import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  makeAppealApplication(I) {
    When(/^I click the Withdraw my appeal link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.withdraw);
    });

    Then(/^I should see the Ask to withdraw the appeal page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.withdraw);
    });
  }
};
