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

    When(/^I click the Ask for a judge to review a decision by a Tribunal Caseworker link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.judgesReview);
    });

    When(/^I click the Ask for something else link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.other);
    });

    When(/^I click the Ask for the appeal to be reinstated link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.reinstate);
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

    Then(/^I should see the Ask for a judge to review a decision page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.judgesReview);
    });

    Then(/^I should see the Ask for something else page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.other);
    });

    Then(/^I should see the Ask for the appeal to be reinstated page$/, async (text: string) => {
      await I.seeInCurrentUrl(paths.makeApplication.reinstate);
    });
  }
};
