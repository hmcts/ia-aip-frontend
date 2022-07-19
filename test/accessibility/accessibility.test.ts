import * as fs from 'fs';
import puppeteer, { Browser } from 'puppeteer';
const pa11y = require('pa11y');
const html = require('pa11y-reporter-html');
const { bootstrap, teardown } = require('../functional/bootstrap');

describe('Test accessibility', async function() {
  // tslint:disable:no-console
  const path = 'functional-output/accessibility';
  let browser: Browser;
  let pages;
  this.retries(3);
  before('launch browser and pages', async function() {
    try {
      bootstrap(() => {
        console.log('Started server');
      });
      browser = await puppeteer.launch({
        timeout: 20000,
        ignoreHTTPSErrors: true
      });
    } catch (error) {
      console.log('error');
    }
  });
  // beforeEach(async () => {
  //   pages = [
  //     await browser.newPage(),
  //     await browser.newPage()
  //   ];
  // })
  after('close browser and pages', async function() {
    // for (const page of pages) {
    //   await page.close();
    // }
    await browser.close();
    await teardown(() => {
      console.log('Shutdown completed');
    });
  });
  it('should test page', async function() {
    try {
      const options = {
        log: {
          debug: console.log,
          error: console.error,
          info: console.log
        },
        browser,
        standard: 'WCAG2AAA'
      };
      const appealOverviewActions = [
        'set field #username to setupcase@example.com',
        'click element #login'
      ];
      const aboutAppealActions = [
        ...appealOverviewActions,
        'navigate to http://localhost:3000/about-appeal'
      ];
      const results = await Promise.all([
        pa11y('http://localhost:3000', options),
        pa11y('http://localhost:3000/appeal-overview', { ...options, actions: appealOverviewActions }),
        pa11y('http://localhost:3000/about-appeal', { ...options, actions: aboutAppealActions })
      ]);

      if (!fs.existsSync(path)) { fs.mkdirSync(path); }
      results.map(async result => {
        const htmlResults = await html.results(result);
        const fileName = result.pageUrl.split('/').pop();
        fs.writeFileSync(`${path}/${fileName}.html`, htmlResults);
      });
    } catch (error) {
      console.log(error);
    }
  });
});
