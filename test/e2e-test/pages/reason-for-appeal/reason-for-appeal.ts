module.exports = {
  reasonsForAppeal(I) {
    When(/^I visit reasons for appeal$/, async () => {
      await I.amOnPage('https://localhost:3000/case-building/reason-for-appeal');
    });
    Then(/^I enter "([^"]*)" into the reason for appeal text box and click Save and Continue$/, async (text: string) => {
      await I.fillField('#moreDetail', text);
      await I.click('Save and continue');
    });
    Then(/^I should see the additional supporting evidence page$/, async () => {
      await I.seeInCurrentUrl('/case-building/reason-for-appeal/supporting-evidence');
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
