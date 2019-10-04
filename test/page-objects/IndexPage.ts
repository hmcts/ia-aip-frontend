import { BasePage } from './BasePage';

export class IndexPage extends BasePage {
  constructor(page) {
    super(page, 'Title is', '/');
  }
}
