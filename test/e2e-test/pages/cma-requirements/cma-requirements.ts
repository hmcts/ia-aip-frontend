import moment from 'moment';
import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';
import { fillInDate } from '../helper-functions';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  cmaRequirements(I) {

    Then(/^I should see the cma requirements task-list page$/, async () => {
      await I.seeInCurrentUrl(paths.awaitingCmaRequirements.taskList);
      await I.see('Tell us your appointment needs', 'h1');
    });

    When(/^I enter a valid in-range date$/, async () => {
      const validDate = moment().add(4, 'week');
      fillInDate(validDate.date(), (validDate.month() + 1), validDate.year());
    });

    When('I choose Yes and click save and continue', async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    When('I choose No and click save and continue', async () => {
      await I.checkOption('#answer-2');
      await I.click('Save and continue');
    });
  }
};
