import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  pcqQuestions(I) {

    Then(/^I should be taken to the pcq-questions page$/, async () => {
      await I.see('Equality and diversity questions', 'h1');
    });
  }
};
