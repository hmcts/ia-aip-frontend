import { getCitizenUserFromThread, UserInfo } from '../../wip/user-service';
const { I } = inject();
let currentUserDetails;

function signInForUser(email: string) {
  I.fillField('#username', email);
  I.click('Sign in');
  I.wait(5);
}

async function signInForUserFromThread() {
  const user: UserInfo = getCitizenUserFromThread();
  I.fillField('#username', user.email);
  I.fillField('#password', user.password);
  I.click('Sign in');
  I.wait(5);
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
  currentUserDetails
};
