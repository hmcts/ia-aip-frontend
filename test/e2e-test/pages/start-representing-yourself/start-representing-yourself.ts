import { paths } from '../../../../app/paths';

const config = require('config');

const testUrl = config.get('testUrl');

let NotifyClient = require('notifications-node-client').NotifyClient;
const govNotifyApiKey = config.get('govNotify.accessKey');
let notifyClient = new NotifyClient(govNotifyApiKey);
let caseReferenceNumber;
let appealRef;
let accessCode;
let firstName;
let lastName;

module.exports = {
  startRepresentingYourself(I) {
    When(/^I visit the start-representing-yourself page$/, async () => {
      await I.amOnPage(testUrl + '/start-representing-yourself');
      await I.waitForText('Start representing yourself', 30);
    });

    Then(/^I see the start-representing-yourself page content$/, async () => {
      await I.see('Start representing yourself');
      await I.see('You no longer have a legal representative for this appeal. To start representing yourself, you must enter the online case reference number and security code from the email, text message or letter we sent you.');
      await I.see('This will give you access to all the details of your case so far.');
      await I.see('Start now');
    });

    Then(/^I see the confirm case details page/, async () => {
      await I.seeInCurrentUrl('start-representing-yourself/confirm-case-details');
      await I.see('These are your case details. If these are not the correct details, you should contact the Tribunal.');
      await I.see('You can now access your case. You will first need to create an account or sign in if you already have one.');
    });

    Then(/^I am on the self register page$/, async () => {
      await I.seeInCurrentUrl('users/selfRegister');
      await I.waitForText('Sign in to your account.', 30);
      await I.click('Sign in to your account');
      await I.waitForElement('#username', 30);
    });

    When('I get the NoC required data from the sent notification', async () => {
      let response = await notifyClient.getNotifications();
      let data = await response.data.notifications.filter(item => item.template.id === 'abb94a28-62e3-4aea-9dba-9bdea1f6c9ec');
      let emailBody = data[0].body;
      let usefulInfo = emailBody.split('Enter your online case reference number: ')[1]
                                .split('The security code is valid')[0]
                                .split('*Enter this security code: ');
      caseReferenceNumber = usefulInfo[0].trim();
      accessCode = usefulInfo[1].trim();
      let name = emailBody.split('Appellant name:')[1].split('The online service:')[0].trim();
      firstName = name.split(' ')[0];
      lastName = name.split(' ')[1];
      appealRef = emailBody.split('HMCTS reference:')[1].split('Appellant name:')[0].trim();
    });

    Then('I see enter case number page content', async () => {
      await I.waitForText('Enter your online case reference number', 60);
      await I.seeInCurrentUrl('start-representing-yourself/enter-case-number');
      await I.see('Enter your online case reference number');
      await I.see('Enter the online case reference number from the email, text message or letter we sent you.');
      await I.see('Online case reference number');
      await I.see('For example, 1234-1234-1234-1234');
      await I.see('Continue');
    });

    When('I enter the case reference number from notification', async () => {
      await I.waitForElement('#caseReferenceNumber', 60);
      await I.fillField('#caseReferenceNumber', caseReferenceNumber);
    });

    Then('I see enter security code page content', async () => {
      await I.waitForText('Enter your security code', 60);
      await I.seeInCurrentUrl('start-representing-yourself/enter-security-code');
      await I.see('Enter your security code');
      await I.see('Enter the security code from the email, text message or letter we sent you.');
      await I.see('Security code');
      await I.see('Continue');
    });

    When('I enter the security code from notification', async () => {
      await I.waitForElement('#accessCode', 60);
      await I.fillField('#accessCode', accessCode);
    });

    Then('I see the confirm case details page with the correct information', async () => {
      await I.waitForText('Case details', 60);
      await I.seeInCurrentUrl('start-representing-yourself/confirm-case-details');
      await I.see('Case details');
      await I.see('These are your case details. If these are not the correct details, you should contact the Tribunal.');
      await I.see(firstName + ' ' + lastName);
      await I.see(caseReferenceNumber.replace(/(\d{4})(?=\d)/g, '$1-'));
      await I.see('Access your case');
      await I.see('You can now access your case. You will first need to create an account or sign in if you already have one.');
      await I.see('Continue');
    });

    Then('I should see the appeal overview page with the legal rep case details', async () => {
      await I.waitInUrl(paths.common.overview, 10);
      await I.seeInCurrentUrl(paths.common.overview);
      await I.see(firstName + ' ' + lastName);
      await I.see(appealRef);
      await I.see('Nothing to do next');
      await I.see('Your appeal details have been sent to the Tribunal.');
    });
  }
};
