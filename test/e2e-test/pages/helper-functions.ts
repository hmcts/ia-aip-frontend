import * as fs from 'fs';
import { createUser } from '../service/idam-service';
const html = require('pa11y-reporter-html');
const container = require('codeceptjs').container;
const { I } = inject();
const pa11y = require('pa11y');
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

async function checkAccessibility() {
// tslint:disable:no-console
  const path = 'functional-output/accessibility';
  const url = await I.grabCurrentUrl();
  try {
    const options = {
      log: {
        debug: console.log,
        error: console.error,
        info: console.log
      },
      ignoreUrl: true,
      browser: container.helpers('Puppeteer').browser,
      page: container.helpers('Puppeteer').page,
      hideElements: '#cookie-banner, .govuk-phase-banner__content__tag',
      standard: 'WCAG2AAA'
    };
    const results = await Promise.all([
      pa11y(url, options)
    ]);
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    results.map(async result => {
      const htmlResults = await html.results(result);
      const fileName = result.pageUrl.split('/').pop();
      fs.writeFileSync(`${path}/${fileName}.html`, htmlResults);
    });
  } catch (error) {
    console.log(error);
  }
}

export {
  signInHelper,
  signInForUser,
  fillInDate,
  enterRefNumber,
  currentUserDetails,
  checkAccessibility
};
