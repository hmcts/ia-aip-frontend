import { HealthPage } from '../page-objects/HealthPage';

import { Browser, Page } from 'puppeteer';
import { expect } from './config';

const puppeteer = require('puppeteer');
const config = require('config');
const httpProxy = config.get('httpProxy');

describe('Check health check @smoke', () => {
  let healthPage: HealthPage;

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
    healthPage = new HealthPage(page);

  });

  after(async () => {
    if (healthPage && healthPage.close) {
      await healthPage.close();
    }
  });

  it('is healthy', async () => {
    const response = await healthPage.gotoPage();
    // tslint:disable-next-line
    expect(response.ok()).to.be.true;
  });
});

export {};
