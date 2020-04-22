import { paths } from '../../../app/paths';

const textToId = {
  'Your personal details': '#personalDetailsLink',
  'Your contact details': '#contactDetailsLink',
  'Type of appeal': '#typeOfAppealLink',
  'Check and send your appeal': '#checkAndSendLink'
};

module.exports = {
  taskList(I) {
    Then('I should see the task-list page', async () => {
      await I.seeInCurrentUrl(paths.appealStarted.taskList);
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

    Then('I should be taken to the task-list page', async () => {
      await I.seeInCurrentUrl(paths.appealStarted.taskList);
    });

    When('I click Your personal details', async () => {
      await I.click('Your personal details');
    });
  }
};
