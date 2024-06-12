import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  pcqQuestions(I) {

    Then(/^I should be taken to the pcq-questions page$/, async () => {
      await I.waitForText('Equality and diversity questions', 30);
      await I.see('Equality and diversity questions', 'h1');
    });
  }
};
