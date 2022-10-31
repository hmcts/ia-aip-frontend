import { paths } from '../../../../app/paths';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  startRepresentingYourself(I) {
    When(/^I visit the start-representing-yourself page$/, async () => {
      await I.amOnPage(testUrl + paths.startRepresentingYourself.start);
      await I.see('You no longer have a legal representative for this appeal. To start representing yourself, you must enter the online case reference number and security code from the email, text message or letter we sent you.');
    });

    When(/^I enter the case reference number `?([^\s`]+)`?$/, async (caseReferenceNumber) => {
      await I.waitForElement('#caseReferenceNumber', 60);
      await I.seeInCurrentUrl('start-representing-yourself/enter-case-number');
      await I.fillField('#caseReferenceNumber', caseReferenceNumber);
      await I.click('Continue');
    });

    When(/^I enter the access code `?([^\s`]+)`?$/, async (accessCode) => {
      await I.waitForElement('#accessCode', 60);
      await I.seeInCurrentUrl('start-representing-yourself/enter-security-code');
      await I.fillField('#accessCode', accessCode);
      await I.click('Continue');
    });

    Then(/^I complete the case details page$/, async () => {
      await I.waitForText('These are your case details. If these are not the correct details, you should contact the Tribunal.', 60);
      await I.seeInCurrentUrl('start-representing-yourself/confirm-case-details');
      await I.click('Continue');
    });

    Then(/^I am on the self register page$/, async () => {
      await I.seeInCurrentUrl('users/selfRegister');
    });
  }
};
