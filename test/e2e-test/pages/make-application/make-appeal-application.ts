import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  makeAppealApplication(I) {
    When(/^I click the Withdraw my appeal link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.withdraw);
    });

    When(/^I click the Ask to link or unlink with another appeal link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.linkOrUnlink);
    });

    When(/^I click the Ask to change some of your details link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.updateAppealDetails);
    });

    Then(/^I should see the Ask to withdraw the appeal page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.withdraw);
    });

    Then(/^I should see the Ask to change some of your details page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.updateAppealDetails);
    });

    Then(/^I should see the Ask to link or unlink this appeal page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.linkOrUnlink);
    });
  }
};
