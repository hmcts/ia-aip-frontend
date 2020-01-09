module.exports = {
  reasonsForAppeal(I) {
    When(/^I visit reasons for appeal$/, async () => {
      await I.amOnPage('https://localhost:3000/reasons/reason-for-appeal');
    });
    Then(/^I enter "([^"]*)" into the reason for appeal text box and click Save and Continue$/, async (text: string) => {
      await I.fillField('#moreDetail',text);
      await I.click('Save and continue');
    });
    Then(/^I should see error summary$/, async () => {
      await I.seeElement('#error-summary-title');
    });
    // tslint:disable-next-line:no-empty
    Then(/^I should see the additional evidence page$/, async () => {
    });
    When(/^I click save for later$/,async () => {
      await I.click('[name="saveForLater"]');
    });
    // TODO send back button to timeline screen and also click continue to get back to reasons for appeal
    When(/^I click the back button on reasons for appeal$/,async () => {
      await I.click('.govuk-back-link');
    });
    Then(/^I should be taken to the appllant timeline$/,async () => {
      await I.seeInCurrentUrl('appellant-timeline');
    });
  }
};
