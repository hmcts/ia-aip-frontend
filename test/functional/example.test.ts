import { Browser, Page } from 'puppeteer';
import { IndexPage } from '../page-objects/IndexPage';
import { startAppServer, tearDown } from '../accessibility/config/common';

const puppeteer = require('puppeteer');
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
    let page: Page;
    if (process.env.NODE_ENV === 'development') {
      const server = await startAppServer();
      page = server.page;
    } else {
      const browser: Browser = await startBrowser();
      page = await browser.newPage();
    }
    indexPage = new IndexPage(page);
    await indexPage.gotoPage();
    await indexPage.screenshot('start_service');
  });

  after(async () => {
    if (indexPage && indexPage.close) {
      await indexPage.close();
    }
    await tearDown();
  });

  it('load index page check title', () => {
    return indexPage.verifyPage();
  });
});

export {};
