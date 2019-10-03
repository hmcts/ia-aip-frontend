import { Page } from 'puppeteer';
const { expect } = require('../config');
const config = require('config');

const testUrl = config.get('testUrl');

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
  }

  async close() {
    await this.page.close();
  }

  async gotoPage() {
    await this.page.goto(`${testUrl}${this.pagePath}`);
  }

  async screenshot(filename) {
    await this.page.screenshot({
      fullPage: true,
      path: `functional-output/functional-screenshots/${filename}.png`
    });
  }
}
