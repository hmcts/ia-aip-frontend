import { Page } from 'puppeteer';
import { IndexPage } from '../page-objects/IndexPage';
import { getNewPage, tearDown } from '../utils/common';

describe('Load index page', () => {
  let indexPage: IndexPage;

  before('setup browser', async () => {
    const page: Page = await getNewPage();
    indexPage = new IndexPage(page);
    await indexPage.gotoPage();
    await indexPage.screenshot('functional-screenshots', 'start_service');
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
