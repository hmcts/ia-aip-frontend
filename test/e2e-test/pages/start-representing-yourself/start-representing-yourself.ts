import { paths } from '../../../../app/paths';
import Logger, { getLogLabel } from '../../../../app/utils/logger';
import { getCitizenUserFromThread, UserInfo } from '../../service/user-service';
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const config = require('config');

const testUrl = config.get('testUrl');

let NotifyClient = require('notifications-node-client').NotifyClient;
const govNotifyApiKey = config.get('govNotify.accessKey');
let notifyClient = new NotifyClient(govNotifyApiKey);
let caseReferenceNumber: string;
let appealRef: string;
let accessCode: string;
let firstName: string;
let lastName: string;

function setCaseReferenceNumber(value: string) {
  caseReferenceNumber = value;
}

function setAppealRef(value: string) {
  appealRef = value;
}

function setAccessCode(value: string) {
  accessCode = value;
}

function setFirstName(value: string) {
  firstName = value;
}

function setLastName(value: string) {
  lastName = value;
}

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
      let emailBody = await waitForNocEmailSent(getCitizenUserFromThread());
      let rows: string[] = emailBody.split('\n');
      setAppealRef(findAndRemoveFromRow(rows, 'HMCTS reference:'));
      setCaseReferenceNumber(findAndRemoveFromRow(rows, '*Enter your online case reference number:'));
      setAccessCode(findAndRemoveFromRow(rows, '*Enter this security code:'));
      let name = findAndRemoveFromRow(rows, 'Appellant name:').split(' ');
      setFirstName(name[0]);
      setLastName(name[1]);
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

    When('I grab the appeal reference from ExUi', async () => {
      let locator = 'ccd-markdown > div > markdown > h1';
      await I.waitForElement(locator);
      let caseRecordText: string = await I.grabTextFrom(locator);
      let appealReference: string = caseRecordText.split('record for ')[1].trim();
      setAppealRef(appealReference);
    });
  }
};

function findAndRemoveFromRow(rows: string[], str: string) {
  return rows.find((row: string) => row.includes(str)).replace(str, '').trim();
}

async function waitForNocEmailSent(user: UserInfo): Promise<string> {
  const maxAttempts = 15;
  const delay = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.trace(`Checking for notification email, attempt ${attempt}`, logLabel);
    let response = await notifyClient.getNotifications('email', '', '', '');
    const filteredResponse = response.data.notifications
      .filter((item: any) => item.template.id === 'c79d396a-7551-4f2c-854c-b84677fbc19e'
        && item.reference.includes(user.caseId));
    logger.trace(`Found ${filteredResponse.length} matching notifications`, logLabel);
    if (filteredResponse.length > 0 && filteredResponse[0].status === 'delivered') {
      logger.trace(`Notification email found: ${filteredResponse[0].id}`, logLabel);
      return filteredResponse[0].body;
    }
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Notification was not sent within ${maxAttempts * delay / 1000} seconds.`);
}
