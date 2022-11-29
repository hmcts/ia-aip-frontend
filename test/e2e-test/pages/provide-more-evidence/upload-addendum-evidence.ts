import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  uploadAddendumEvidence(I) {
    When(/^I click the Provide more evidence link$/, async () => {
      await I.amOnPage(testUrl + paths.common.provideMoreEvidenceForm);
    });

    Then(/^I should see the provide more evidence page$/, async () => {
      await I.waitInUrl(paths.common.provideMoreEvidenceForm,10);
      await I.seeInCurrentUrl(paths.common.provideMoreEvidenceForm);
    });

    Then(/^I should see the why evidence late page$/, async () => {
      await I.amOnPage(testUrl + paths.common.whyEvidenceLate);
    });

    When(/^I enter "([^"]*)" into the why evidence late text area and click Save and Continue$/, async (text: string) => {
      await I.fillField('#whyEvidenceLate', text);
      await I.click('Continue');
    });

    Then(/^I should see the provide more evidence check page$/, async () => {
      await I.amOnPage(testUrl + paths.common.provideMoreEvidenceCheck);
    });

    Then(/^I should see the provide more evidence sent page$/, async () => {
      await I.amOnPage(testUrl + paths.common.provideMoreEvidenceConfirmation);
    });

    Then(/^I should see "([^"]*)" on the page$/, async (text: string) => {
      await I.see(text);
    });
  }
};
