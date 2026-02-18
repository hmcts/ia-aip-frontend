import { step } from 'allure-js-commons';
import { assertNoAxeViolations } from './axeHelper';

describe('Accessibility', function() {
  it('Compile report', async function() {
    // eslint-disable-next-line:await-promise
    await step('When I compile the accessibility results into a json report then there should be no axe violations', () => {
      assertNoAxeViolations();
    });
  });
});
