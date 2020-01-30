import { paths } from '../../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  reasonForAppealConfirmation(I) {
    Then('I should see the reasons for appeal confirmation page', async () => {
      I.seeInCurrentUrl(testUrl + paths.reasonForAppeal.confirmation);
    });
  }
};
