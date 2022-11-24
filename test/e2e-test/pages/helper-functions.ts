import { createUser } from '../service/idam-service';
const { I } = inject();
let currentUserDetails;

async function signInHelper() {
  const environment: string = process.env.NODE_ENV;
  if (environment !== ('test' || 'development')) {
    let userDetails = await createUser();
    I.fillField('#username', userDetails.email);
    I.fillField('#password', userDetails.password);
    currentUserDetails = userDetails;
  }
  I.click('Sign in');
  I.wait(5);
}

function signInForUser(email: string) {
  I.fillField('#username', email);
  I.click('Sign in');
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
  signInHelper,
  signInForUser,
  fillInDate,
  enterRefNumber,
  currentUserDetails
};
