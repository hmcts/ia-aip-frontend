import { paths } from '../../../app/paths';

const textToId = {
  'Your personal details': '#personalDetailsLink',
  'Your contact details': '#contactDetailsLink',
  'Type of appeal': '#typeOfAppealLink',
  'Decision type': '#typeOfDecisionLink',
  'Check and send your appeal': '#checkAndSendLink'
};

module.exports = {
  taskList(I) {
    Then('I should see the task-list page', async () => {
      await I.waitInUrl(paths.appealStarted.taskList,10);
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
      await I.waitInUrl(paths.appealStarted.taskList,10);
      await I.seeInCurrentUrl(paths.appealStarted.taskList);
    });

    When('I click Your personal details', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await I.click('#personalDetailsLink');
          await I.waitInUrl(paths.appealStarted.name, 20);
          await I.seeInCurrentUrl(paths.appealStarted.name);
          break;
        } catch (e) {
          await I.seeInCurrentUrl(paths.appealStarted.taskList);
        }
      }
      await I.seeInCurrentUrl(paths.appealStarted.name);
    });

    Given(/^I should (see|not see) the "([^"]*)" task sub title in the task list$/, async (visibility: string, title: string) => {
      if (visibility === 'see') {
        await I.see(title, 'h2.govuk-heading-m');
      } else {
        await I.dontSee(title, 'h2.govuk-heading-m');
      }
    });

    Given(/^I should (see|not see) the "([^"]*)" task in "([^"]*)" state/, async (visibility: string, title: string, state: string) => {
      const rowLocator = locate('li.task-list__item').withText(title);
      const stateLocator = rowLocator.find('strong.govuk-tag').withText(state);
      if (visibility === 'see') {
        await I.seeElement(rowLocator);
        await I.seeElement(stateLocator);
      } else {
        await I.dontSeeElement(rowLocator);
        await I.dontSeeElement(stateLocator);
      }
    });
  }
};
