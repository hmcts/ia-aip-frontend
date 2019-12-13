
module.exports = {
  common(I) {
    When(/^I click on back button$/, async () => {
      await I.click('.govuk-back-link');
    });

    Then(/^I should see error summary$/, async () => {
      I.seeElementInDOM('.govuk-error-summary');
    });

    Then(/^I shouldnt see error summary$/, async () => {
      I.dontSeeElementInDOM('.govuk-error-summary');
    });
  }
};
