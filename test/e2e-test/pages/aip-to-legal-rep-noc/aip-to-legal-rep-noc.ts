import { paths } from '../../../../app/paths';
const assert = require('assert');
const config = require('config');
let caseReferenceNumber;
let firstName;
let lastName;
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
    When(/^I get and save the Case Reference number and names$/, async () => {
      await I.waitForText('Online case reference number:', 30);
      let list = await I.grabTextFromAll('li');
      const caseRef = list[0].split(': ')[1];
      let fullName = await list[1].split(': ')[1];
      const forename = fullName.split(' ')[0];
      const surname = fullName.split(' ')[1];
      caseReferenceNumber = caseRef;
      firstName = forename;
      lastName = surname;
    });

    When(/^I log in as a Legal Rep$/, async () => {
      await I.amOnPage(exuiBaseUrl);
      for (let i = 0; i < 5; i++) {
        let success = await I.checkIfExUiLogInIsSuccessful();
        if (success === true) {
          break;
        } else {
          await I.amOnPage(exuiBaseUrl + 'auth/logout');
          await I.waitForElement('#username', 30);
          await I.fillField('#username', config.get('testAccounts.testLawFirmAUsername'));
          await I.fillField('#password', config.get('testAccounts.testLawFirmAPassword'));
          await I.click('Sign in');
        }
      }
      await I.checkIfExUiLogInIsSuccessful();
    });

    When(/^I go to Notice of Change$/, async () => {
      await I.retry(3).amOnPage(exuiBaseUrl + '/noc');
      await I.waitForText('You can use this notice of change (sometimes called a \'notice of acting\') to get access to the digital case file in place of:', 60);
    });

    When(/^I enter the saved case reference number$/, async () => {
      await I.fillField('#caseRef', caseReferenceNumber);
      await I.click('Continue');
    });

    When(/^I enter the saved first and last names$/, async () => {
      await I.waitForText('Enter details', 60);
      await I.fillField('#NoCChallengeQ1', firstName);
      await I.fillField('#NoCChallengeQ2', lastName);
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
