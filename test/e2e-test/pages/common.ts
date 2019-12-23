
module.exports = {
  common(I) {
    When(/^I click on back button$/, async () => {
      await I.click('.govuk-back-link');
    });

    When('I click save for later',async () => {
      I.click({ name: 'saveForLater' });
    });

    When('I click save and continue',async () => {
      I.click({ name: 'saveAndContinue' });
    });

    Then(/^I should see error summary$/, async () => {
      await I.seeElementInDOM('.govuk-error-summary');
      // await I.seeInTitle('Error: ');
    });

    Then(/^I shouldnt see error summary$/, async () => {
      I.dontSeeElementInDOM('.govuk-error-summary');
    });
  }
};
