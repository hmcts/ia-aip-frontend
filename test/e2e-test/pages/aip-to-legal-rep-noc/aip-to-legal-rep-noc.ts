import { appealSubmittedUser } from '../../../wip/user-service';
const config = require('config');
let exuiBaseUrl;

const testUrl = config.get('testUrl');

if (testUrl.includes('localhost')) {
  exuiBaseUrl = 'http://localhost:3002/';
} else if (testUrl.includes('aat') || testUrl.includes('preview')) {
  exuiBaseUrl = 'https://manage-case.aat.platform.hmcts.net/';
} else if (testUrl.includes('demo')) {
  exuiBaseUrl = 'https://manage-case.demo.platform.hmcts.net/';
}
module.exports = {
  aipToLegalRepNoC(I) {
    When(/^I log in as a Legal Rep$/, async () => {
      await I.amOnPage(exuiBaseUrl);
      for (let i = 0; i < 5; i++) {
        let success = await I.checkIfExUiLogInIsSuccessful();
        if (success === true) {
          break;
        } else {
          await I.amOnPage(exuiBaseUrl + 'auth/logout');
          await I.amOnPage(exuiBaseUrl);
          await I.waitForElement('#username', 30);
          await I.fillField('#username', config.get('testAccounts.testLawFirmAUsername'));
          await I.fillField('#password', process.env.TEST_LAW_FIRM_SHARE_CASE_A_PASSWORD);
          await I.click('Sign in');
        }
      }
      await I.checkIfExUiLogInIsSuccessful();
    });

    When(/^I go to Notice of Change$/, async () => {
      await I.retry(3).amOnPage(exuiBaseUrl + '/noc');
      await I.waitForText('You can use this notice of change (sometimes called a \'notice of acting\') to get access to the digital case file in place of:', 60);
    });

    When(/^I enter the saved case reference number from state "([^"]*)"$/, async (appealState) => {
      if (appealState === 'appealSubmitted') {
        await I.fillField('#caseRef', appealSubmittedUser.caseId);
      }
      await I.click('Continue');
    });

    When(/^I enter the saved first and last names from state "([^"]*)"$/, async (appealState) => {
      await I.waitForText('Enter your client\'s details', 60);
      if (appealState === 'appealSubmitted') {
        await I.fillField('#NoCChallengeQ1', appealSubmittedUser.forename);
        await I.fillField('#NoCChallengeQ2', appealSubmittedUser.surname);
      }
      await I.click('Continue');
    });

    When(/^I complete the notice of change$/, async () => {
      await I.waitForText('Check and submit', 60);
      await I.click('#affirmation');
      await I.click('#notifyEveryParty');
      await I.click('Submit');
      await I.waitForText('Notice of change successful', 60);
    });

    Then(/^I should see the success screen$/, async () => {
      await I.see('Notice of change successful');
    });
  }
};
