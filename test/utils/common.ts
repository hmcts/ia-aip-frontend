/* tslint:disable:no-console */
import config from 'config';
import * as http from 'http';
import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import { createApp } from '../../app/app';
import Logger from '../../app/utils/logger';

const httpProxy = config.get('httpProxy');
const testUrl = config.get('testUrl');
const port: number | string = process.env.PORT || 3000;
const logger: Logger = new Logger();

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
  const testingLocalhost = testUrl.indexOf('localhost') !== -1;
  if (testingLocalhost) {
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

  const opts: LaunchOptions = {
    args,
    headless: true,
    timeout: 10000,
    ignoreHTTPSErrors: true
  };

  browser = await puppeteer.launch(opts);

  // If browser crashes try to reconnect
  browser.on('disconnected', startBrowser);
  return browser;
}

export async function startAppServer(): Promise<{ browser: Browser; page: Page }> {
  const logLabel: string = 'common.ts::startAppServer';
  const testingLocalhost = testUrl.indexOf('localhost') !== -1;
  if (!server && testingLocalhost) {
    server = createApp().listen(port, () => {
      logger.trace(`Server listening on port ${port}`, logLabel);
    })
    .on('error',
      (error: Error) => {
        logger.exception(`Unable to start server because of ${error.message}`, logLabel);
      }
    );

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
