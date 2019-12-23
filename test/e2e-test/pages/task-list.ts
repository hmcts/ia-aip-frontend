const textToId = {
  'Your personal details': '#personalDetailsLink',
  'Your contact details': '#contactDetailsLink'
};

module.exports = {
  taskList(I) {
    Then('I should see the task-list page', async () => {
      await I.seeInCurrentUrl('task-list');
    });

    Then('I shouldnt be able to click Personal details', async () => {
      await I.seeInSource('Your personal details');
      await I.dontSeeElement('#personalDetailsLink');
    });

    Then('I should be able to click Personal details', async () => {
      await I.seeElement('#personalDetailsLink');
    });

    Then(/^I shouldnt be able to click "([^"]*)"$/, async (category) => {
      await I.seeInSource(category);
      await I.dontSeeElement(textToId[category]);
    });

    Then(/^I should be able to click "([^"]*)"$/, async (category) => {
      await I.seeElement(textToId[category]);
    });
  }
};
