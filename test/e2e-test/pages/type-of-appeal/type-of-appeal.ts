module.exports = {
  typeOfAppeal(I) {
    When(/^I click on the type\-of\-appeal link$/, async () => {
      await I.click('Type of appeal');
    });
    Then(/^I should be taken to the appeal page$/, async () => {
      await I.seeInCurrentUrl('type-of-appeal');
    });
    When(/^I click on Protection as my type of appeal and click Save and continue$/, async () => {
      await I.checkOption('Protection');
      await I.click('.govuk-button');
    });

    Then(/^I should be taken to the task\-list page$/, async () => {
      await I.seeInCurrentUrl('task-list');
    });
  }
};
