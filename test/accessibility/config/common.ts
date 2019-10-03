/* tslint:disable:no-console */
import * as http from 'http';
import { Browser, Page } from 'puppeteer';

import config = require('config');

const puppeteer = require('puppeteer');
const httpProxy = config.get('httpProxy');
const testUrl = config.get('testUrl');

const localhost = testUrl.indexOf('localhost') !== -1;
const { setup } = require('../../../app/app');

let server: http.Server;
let browser: Browser;
let page: Page;

export const pa11yConfig = {
  includeWarnings: false,
  ignore: ['notice'],
  chromeLaunchConfig: { ignoreHTTPSErrors: true },
  hideElements: 'link[rel=mask-icon], .govuk-header__logotype-crown, .govuk-footer__licence-logo, .govuk-skip-link, .govuk-footer__link'
};

export async function tearDown() {
  if (browser) {
    console.log('Killing browser');
    await browser.close();
  }
  if (server) {
    console.log('Killing server');
    server.close();
  }
}

export async function startBrowser() {
  if (!browser) {
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
    browser = await puppeteer.launch(opts);
  }
  return browser;
}

export async function startAppServer(): Promise<{ browser: Browser; page: Page }> {
  if (!server && localhost) {
    server = setup();
    const browser = await startBrowser();
    try {
      page = await browser.newPage();
    } catch (error) {
      console.error('Error when opening new tab', error);
    }
    await page.setViewport({
      height: 1024,
      width: 768
    });
  }
  return { page, browser };
}
