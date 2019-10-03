import { Page } from 'puppeteer';

const { expect } = require('../unit/config');
const testUrl = require('config').get('testUrl');

export class BasePage {
  public page: Page;
  public pageTitle: String;
  public pagePath: String;

  constructor(page: Page, pageTitle: String, pagePath: String) {
    this.page = page;
    this.pageTitle = pageTitle;
    this.pagePath = pagePath;
  }

  async verifyPage() {
    const title = await this.page.title();
    expect(title).to.equal(this.pageTitle);
    expect(this.page.url()).to.contain(`${testUrl}${this.pagePath}`);
  }

  async close() {
    await this.page.close();
  }

  async gotoPage() {
    await this.page.goto(`${testUrl}${this.pagePath}`);
  }
}
