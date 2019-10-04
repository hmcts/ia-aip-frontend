import { Page } from 'puppeteer';
import { expect } from '../utils/testUtils';
import { getNewPage, tearDown } from '../utils/common';
import { HealthPage } from './page-objects/HealthPage';

const puppeteer = require('puppeteer');
describe('Check health check @smoke', () => {
  let healthPage: HealthPage;

  before('setup browser', async () => {
    const page: Page = await getNewPage();
    healthPage = new HealthPage(page);

  });

  after(async () => {
    if (healthPage && healthPage.close) {
      await healthPage.close();
    }
    await tearDown();
  });

  it('is healthy', async () => {
    const response = await healthPage.gotoPage();
    // tslint:disable-next-line
    expect(response.ok()).to.be.true;
  });
});

export {};
