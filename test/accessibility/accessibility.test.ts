import puppeteer, { LaunchOptions, Page } from 'puppeteer';
import { IndexPage } from '../page-objects/IndexPage';
const { bootstrap, teardown } = require('../functional/bootstrap');
import { paths } from '../../app/paths';
import { expect } from '../utils/testUtils';
import { pa11yConfig } from './config/common';

const testUrl = require('config').get('testUrl');
const pa11y = require('pa11y');

const pathsToIgnore = [
  paths.health, paths.liveness, paths.healthLiveness, paths.logout, paths.redirectUrl, paths.start,
  paths.homeOffice.deleteEvidence, paths.homeOffice.uploadEvidence, paths.checkAndSend
];
const errorTitles = ['Page not found', 'Service unavailable'];

describe('Home page ', () => {
  let page: Page;
  let indexPage: IndexPage;

  before('start service', async () => {
    bootstrap(() => {
      // tslint:disable-next-line:no-console
      console.log('Started server');
    });
    const browser = await startBrowser();
    page = await browser.newPage();
    indexPage = new IndexPage(page);
    pa11yConfig.browser = browser;
    pa11yConfig.page = page;
    await indexPage.gotoPage();
  });

  async function startBrowser() {

    const args = ['--no-sandbox', '--start-maximized', '--ignore-certificate-errors'];

    const opts: LaunchOptions = {
      args,
      headless: false,
      timeout: 20000,
      ignoreHTTPSErrors: true
    };

    const browser = await puppeteer.launch(opts);

    // If browser crashes try to reconnect
    browser.on('disconnected', startBrowser);
    return browser;
  }

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
    await teardown(() => {
      // tslint:disable-next-line:no-console
      console.log('Shutdown completed');
    });
  });

  it('checks "/" does not have issues ', async function () {
    await indexPage.verifyPage();
    const result = await pa11y(`${testUrl}${indexPage.pagePath}`, pa11yConfig);
    expect(result.issues).to.eql([]);
  });

  async function checkPath(pathsToCheck, errors) {
    for (const path of Object.values(pathsToCheck)) {
      if (typeof path === 'string') {
        if (pathsToIgnore.indexOf(path) === -1) {
          // tslint:disable-next-line:no-console
          console.log(`Checking [${path}]`);
          const result = await pa11y(`https://localhost:3000${path}`, pa11yConfig);

          if (result.issues.length > 0 || errorTitles.some(title => result.documentTitle.includes(title))) {
            errors.push(result);
          }
        }
      } else {
        errors = await checkPath(path, errors);
      }
    }

    return errors;
  }

  it('checks pages does not have issues', async function () {
    this.timeout(50000);
    await indexPage.login();
    const errors = await checkPath(paths, []);
    expect(errors).to.eql([]);
  });
});
