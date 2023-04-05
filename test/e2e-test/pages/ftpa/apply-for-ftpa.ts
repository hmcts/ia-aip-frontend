import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  applyForFTPAAppellant(I) {
    When(/^I click the Apply for permission to appeal to the Upper Tribunal link$/, async () => {
      await I.amOnPage(testUrl + paths.ftpa.ftpaApplication);
    });

    Then(/^I should see the ftpa reason page$/, async () => {
      await I.waitInUrl(paths.ftpa.ftpaReason,10);
      await I.seeInCurrentUrl(paths.ftpa.ftpaReason);
    });

    Then(/^I fill in the textarea with "([^"]*)"$/, async (text: string) => {
      await I.fillField('#ftpaReason', text);
    });
  }
};
