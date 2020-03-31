import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';

const testUrl = require('config').get('testUrl');

module.exports = {
  eligible(I) {
    When('I go to eligible page without answering the questions', async () => {
      I.amOnPage(testUrl + paths.common.eligible);
    });

    When('I click continue', async () => {
      I.click('Continue');
    });

    Then('I should see the eligible page', async () => {
      I.seeInSource(i18n.pages.eligiblePage.heading);
    });
  }
};
