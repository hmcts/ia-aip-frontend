import { pa11yConfig, startBrowser, tearDown } from './config/common';
import { Browser, Page } from 'puppeteer';
import { IndexPage } from '../page-objects/IndexPage';
import { expect } from '../unit/config';

const testUrl = require('config').get('testUrl');
const pa11y = require('pa11y');

describe('Home page ', () => {
  let page: Page;
  let indexPage: IndexPage;

  before('start service', async () => {
    const browser: Browser = await startBrowser();
    const page: Page = await browser.newPage();
    indexPage = new IndexPage(page);
    await indexPage.gotoPage();
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
    await tearDown();
  });

  it('is on the correct page', async () => {
    await indexPage.verifyPage();
  });

  it('checks "/" does not have issues ', async function () {
    const result = await pa11y(`${testUrl}${indexPage.pagePath}`, pa11yConfig);
    expect(result.issues.length).to.equal(0);
  });
});
