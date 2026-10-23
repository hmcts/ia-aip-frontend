import { emailToUserId } from '../../mock/idam/handlers/getDetails';
import { getCitizenUserFromThread, UserInfo } from '../service/user-service';
const { I } = inject();
let currentUserDetails;

function signInForUser(email: string) {
  I.fillField('#username', email);
  I.click('Sign in');
  I.wait(1);
}

function signInForUserWithId(email: string) {
  I.fillField('#username', email);
  I.click('Sign in');
  I.wait(1);
  return emailToUserId[email];
}

async function signInForUserFromThread() {
  const user: UserInfo = getCitizenUserFromThread();
  await loginAsUser(I, user.email, user.password);
}

async function loginAsUser(I, email: string, password: string, exui?: boolean) {
  if (!exui) {
    await I.waitForText('Sign in or create an account', 15);
    await I.click('//*[contains(@class, \'govuk-button\') and contains(text(),\'Sign in\')]');
  }
  await I.waitForText('Enter your email address', 15);
  await I.fillField('#email', email);
  await I.click('//*[contains(@class, \'govuk-button\') and contains(text(),\'Continue\')]');
  await I.waitForText('Enter your password', 15);
  await I.fillField('#password', password);
  await I.click('//*[contains(@class, \'govuk-button\') and contains(text(),\'Continue\')]');
  await I.wait(1);
}

function fillInDate(day, month, year) {
  I.fillField('#day', day);
  I.fillField('#month', month);
  I.fillField('#year', year);
}

function enterRefNumber(refNumber) {
  I.fillField('#homeOfficeRefNumber', refNumber);
  I.click('.govuk-button');
}

export {
  signInForUser,
  fillInDate,
  enterRefNumber,
  signInForUserFromThread,
  signInForUserWithId,
  loginAsUser,
  currentUserDetails
};
