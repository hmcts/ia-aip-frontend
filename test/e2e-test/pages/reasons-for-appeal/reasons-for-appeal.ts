import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  reasonsForAppeal(I) {
    When(/^I visit reasons for appeal$/, async () => {
      await I.amOnPage(testUrl + paths.reasonsForAppeal.decision);
    });

    Then(/^I should see the reasons for appeal decision page$/, async () => {
      await I.seeInCurrentUrl(paths.reasonsForAppeal.decision);
    });

    Then(/^I enter "([^"]*)" into the reason for appeal text area$/, async (text: string) => {
      await I.fillField('#applicationReason', text);
    });

    Then(/^I enter "([^"]*)" into the reason for appeal text box and click Save and Continue$/, async (text: string) => {
      await I.fillField('#applicationReason', text);
      await I.click('Save and continue');
    });
    Then(/^I should see the additional supporting evidence page$/, async () => {
      await I.seeInCurrentUrl(paths.reasonsForAppeal.supportingEvidence);
    });
    // TODO send back button to timeline screen and also click continue to get back to reasons for appeal
    When(/^I click the back button on reasons for appeal$/, async () => {
      await I.click('.govuk-back-link');
    });
    Then(/^I should be taken to the appellant timeline$/, async () => {
      await I.seeInCurrentUrl('appellant-timeline');
    });

    When(/^I select Yes and click continue$/, async (selection: string) => {
      await I.checkOption('#answer');
      await I.click('Continue');
    });

    When(/^I select No and click continue$/, async (selection: string) => {
      await I.checkOption('#answer-2');
      await I.click('Continue');
    });
  }
};
