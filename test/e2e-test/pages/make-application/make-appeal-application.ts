import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

const PATHS = {
  'Ask to withdraw the appeal': paths.makeApplication.withdraw
};

module.exports = {
  makeAppealApplication(I) {
    When(/^I click the "([^"]*)" link$/, async (text: string) => {
      await I.click(text);
    });

    Then(/^I should see the "([^"]*)" page$/, async (text: string) => {
      await I.seeInCurrentUrl(PATHS[text]);
    });
  }
};
