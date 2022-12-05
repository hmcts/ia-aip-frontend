import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  reasonsForAppeal(I) {
    When(/^I visit reasons for appeal$/, async () => {
      await I.amOnPage(testUrl + paths.awaitingReasonsForAppeal.decision);
    });

    Then(/^I should see the reasons for appeal decision page$/, async () => {
      await I.waitInUrl(paths.awaitingReasonsForAppeal.decision,10);
      await I.seeInCurrentUrl(paths.awaitingReasonsForAppeal.decision);
    });

    Then(/^I should see the "supporting evidence question" page$/, async () => {
      await I.waitInUrl(paths.awaitingReasonsForAppeal.supportingEvidence,10);
      await I.seeInCurrentUrl(paths.awaitingReasonsForAppeal.supportingEvidence);
    });

    Then(/^I enter "([^"]*)" into the reason for appeal text area$/, async (text: string) => {
      await I.fillField('#applicationReason', text);
    });

    Then(/^I enter "([^"]*)" into the reason for appeal text box and click Save and Continue$/, async (text: string) => {
      await I.fillField('#applicationReason', text);
      await I.click('Save and continue');
    });
    Then(/^I should see the additional supporting evidence page$/, async () => {
      await I.waitInUrl(paths.awaitingReasonsForAppeal.supportingEvidence,10);
      await I.seeInCurrentUrl(paths.awaitingReasonsForAppeal.supportingEvidence);
    });
    // TODO send back button to timeline screen and also click continue to get back to reasons for appeal
    When(/^I click the back button on reasons for appeal$/, async () => {
      await I.click('.govuk-back-link');
    });
    Then(/^I should be taken to the appellant timeline$/, async () => {
      await I.waitInUrl('appellant-timeline',10);
      await I.seeInCurrentUrl('appellant-timeline');
    });
  }
};
