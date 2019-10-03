import { Browser } from 'puppeteer';

const puppeteer = require('puppeteer');
const config = require('config');
const httpProxy = config.get('httpProxy');

let browser: Browser;

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
