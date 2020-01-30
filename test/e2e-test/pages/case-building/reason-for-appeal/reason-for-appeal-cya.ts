import { paths } from '../../../../../app/paths';

module.exports = {
  reasonForAppealCYA(I) {
    Then('I should see the reasons for appeal CYA page', async () => {
      I.seeInCurrentUrl(paths.reasonForAppeal.checkAndSend);
    });
  }
};
