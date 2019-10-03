import { BasePage } from './BasePage';

export class HealthPage extends BasePage {
  constructor(page) {
    super(page, 'health check', '/health');
  }
}
