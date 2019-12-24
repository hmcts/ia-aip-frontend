import { expect } from '../utils/testUtils';
import { BasePage } from './BasePage';

export class IndexPage extends BasePage {
  constructor(page) {
    super(page, 'Home', '/');
  }

  async login() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click('.govuk-button')
    ]);
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click('#login')
    ]);

    const title = await this.page.title();
    expect(title).to.equal('Task List - Immigration & Asylum - GOV.UK');
  }
}
