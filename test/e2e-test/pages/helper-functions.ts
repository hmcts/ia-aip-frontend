const rp = require('request-promise');

const idamApiUrl = require('config').get('idam.apiUrl');
const { I } = inject();

async function createUser() {
  const randomNumber = parseInt(Math.random() * 10000000 + '', 10);
  const email = `ia_citizen${randomNumber}@hmcts.net`;
  const password = 'Apassword123';
  const options = {
    url: `${idamApiUrl}/testing-support/accounts`,
    json: true,
    body: {
      email: email,
      forename: 'ATestForename',
      password: password,
      surname: 'ATestSurname',
      roles: [
        {
          code: 'citizen'
        }
      ]
    },
    insecure: true,
    timeout: 10000,
    resolveWithFullResponse: true
  };
  try {
    const createUserResult = await rp.post(options);
    // tslint:disable no-console
    console.log(`Call returned ${JSON.stringify(createUserResult, null, 2)}`);

    console.log(`Created idam user for ${email} with password ${password}`);
    return { email: email, password };
  } catch (error) {
    console.log(`Error createUser ${error.message}`);
  }
}

async function signInHelper() {
  if (process.env.NODE_ENV !== 'development') {
    const userDetails = await createUser();
    I.fillField('#username', userDetails.email);
    I.fillField('#password',userDetails.password);
  }
  I.wait(2);
  I.click('.button');
}

function signInForUser(email: string) {
  I.fillField('#username', email);
  I.click('.button');
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
  enterRefNumber
};
