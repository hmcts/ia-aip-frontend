import { IndexPage } from '../page-objects/IndexPage';
import { Browser, Page } from 'puppeteer';
import { startBrowser } from '../common';

describe('Load index page', () => {
  let indexPage: IndexPage;

  before('start services and bootstrap data in CCD/COH', async () => {
    const browser: Browser = await startBrowser();
    const page: Page = await browser.newPage();
    indexPage = new IndexPage(page);
    await indexPage.gotoPage();
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
