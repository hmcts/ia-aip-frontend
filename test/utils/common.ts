/* tslint:disable:no-console */
import * as http from 'http';
import { Browser, Page } from 'puppeteer';
import { getServer } from '../../app/app';
import config = require('config');

const puppeteer = require('puppeteer');
const httpProxy = config.get('httpProxy');
const testUrl = config.get('testUrl');

const localhost = testUrl.indexOf('localhost') !== -1;

let server: http.Server;
let browser: Browser;
let page: Page;

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

export async function getNewPage() {
  let page: Page;
  if (process.env.NODE_ENV === 'development') {
    const server = await startAppServer();
    page = server.page;
  } else {
    const browser: Browser = await startBrowser();
    page = await browser.newPage();
  }
  return page;
}

export async function startBrowser() {

  const args = ['--no-sandbox', '--start-maximized', '--ignore-certificate-errors'];
  if (httpProxy) {
    args.push(`-proxy-server=${httpProxy}`);
  }

  const opts = {
    args,
    headless: true,
    timeout: 10000,
    ignoreHTTPSErrors: true
  };

  browser = await puppeteer.launch({ opts });

  // If browser crashes try to reconnect
  browser.on('disconnected', startBrowser);
  return browser;
}

export async function startAppServer(): Promise<{ browser: Browser; page: Page }> {
  if (!server && localhost) {
    server = getServer();
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
