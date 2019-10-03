import { IndexPage } from './page-objects/IndexPage';

const puppeteer = require('puppeteer');
import { Page, Browser } from 'puppeteer';
const config = require('config');
const httpProxy = config.get('httpProxy');

describe('Load index page', () => {
  let indexPage: IndexPage;

  async function startBrowser() {
    const args = ['--no-sandbox', '--start-maximized'];
    if (httpProxy) {
      args.push(`-proxy-server=${httpProxy}`);
    }

    const opts = {
      args,
      headless: true,
      timeout: 10000,
      ignoreHTTPSErrors: true
    };
    return puppeteer.launch(opts);
  }

  before('setup browser', async () => {
    const browser: Browser = await startBrowser();
    const page: Page = await browser.newPage();
    indexPage = new IndexPage(page);
    await indexPage.gotoPage();
    await indexPage.screenshot('start_service');
  });

  after(async () => {
    if (indexPage && indexPage.close) {
      await indexPage.close();
    }
  });

  it('load index page check title', () => {
    return indexPage.verifyPage();
  });
});

export {};
