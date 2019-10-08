import { Page } from 'puppeteer';
import { expect } from '../utils/testUtils';
import internationalization from '../../locale/en.json';
const config = require('config');

const testUrl = config.get('testUrl');

export class BasePage {
  public page: Page;
  public pageTitle: String;
  public pagePath: String;

  constructor(page: Page, pageTitle: String, pagePath: String) {
    this.page = page;
    this.pageTitle = [pageTitle, internationalization.serviceName, internationalization.provider].join(' - ');
    this.pagePath = pagePath;
  }

  async verifyPage() {
    const title = await this.page.title();
    expect(title).to.equal(this.pageTitle);
  }

  async close() {
    await this.page.close();
  }

  async gotoPage(): Promise<any> {
    return this.page.goto(`${testUrl}${this.pagePath}`);
  }

  async screenshot(folder, filename) {
    await this.page.screenshot({
      fullPage: true,
      path: `functional-output/${folder}/${filename}.png`
    });
  }
}
