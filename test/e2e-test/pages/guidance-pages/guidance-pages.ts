import { paths } from '../../../../app/paths';

module.exports = {
  guidancePages(I) {

    Then(/^I should see the 'Tribunal Caseworker' guidance page$/, async () => {
      await I.waitInUrl(paths.common.tribunalCaseworker,10);
      await I.seeInCurrentUrl(paths.common.tribunalCaseworker);
      await I.see('What is a Tribunal Caseworker?', 'h1');
    });

    Then(/^I should see the 'Understanding your Home Office documents' guidance page$/, async () => {
      await I.waitInUrl(paths.common.homeOfficeDocuments,10);
      await I.seeInCurrentUrl(paths.common.homeOfficeDocuments);
      await I.see('Understanding your Home Office documents', 'h1');
    });

    Then(/^I should see the 'What to expect at your hearing' guidance page$/, async () => {
      await I.waitInUrl(paths.common.whatToExpectAtHearing,10);
      await I.seeInCurrentUrl(paths.common.whatToExpectAtHearing);
      await I.see('What to expect at your hearing', 'h1');
    });

    Then(/^I should see the 'What happens if the Home Office withdraw their decision' guidance page$/, async () => {
      await I.waitInUrl(paths.common.homeOfficeWithdrawDecision,10);
      await I.seeInCurrentUrl(paths.common.homeOfficeWithdrawDecision);
      await I.see('What happens if the Home Office withdraw their decision?', 'h1');
    });

    Then(/^I should see the 'What happens if the Home Office maintain their decision' guidance page$/, async () => {
      await I.waitInUrl(paths.common.homeOfficeMaintainDecision,10);
      await I.seeInCurrentUrl(paths.common.homeOfficeMaintainDecision);
      await I.see('What happens if the Home Office maintain their decision?', 'h1');
    });

  }
};
