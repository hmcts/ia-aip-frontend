import { paths } from '../../../../app/paths';

module.exports = {
  reasonsForAppealCYA(I) {
    Then('I should see the reasons for appeal CYA page', async () => {
      I.seeInCurrentUrl(paths.reasonsForAppeal.checkAndSend);
    });
  }
};
