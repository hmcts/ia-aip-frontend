import nunjucks from 'nunjucks';
import i18n from '../../locale/en.json';
const { expect } = require('chai');

describe('"Skip to main content" link rendering', () => {

  const env = nunjucks.configure([
    'node_modules/govuk-frontend',
    'views'
  ]);

  env.addFilter('eval', function(text: string) {
    return nunjucks.renderString(text, this.ctx);
  });

  env.addGlobal('i18n', i18n);

  const skipToMainContentLink = '<a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>';

  it('should render the "Skip to main content" link in layout.njk with href="#main-content"', () => {

    const rendered = env.render('layout.njk');

    expect(rendered).to.include(skipToMainContentLink);
  });

  it('should render the "Skip to main content" link in guidanceLayout.njk with href="#main-content"', () => {

    const rendered = env.render('guidanceLayout.njk');

    expect(rendered).to.include(skipToMainContentLink);
  });

});

describe('"#main-content" rendering', () => {

  const env = nunjucks.configure([
    'node_modules/govuk-frontend',
    'views'
  ]);

  env.addFilter('eval', function(text: string) {
    return nunjucks.renderString(text, this.ctx);
  });

  env.addGlobal('i18n', i18n);

  const mainContent = '<main class="govuk-main-wrapper " id="main-content" role="main" tabindex="-1">';

  it('should render "#main-content" in layout.njk with tabindex="-1"', () => {

    const rendered = env.render('layout.njk');

    expect(rendered).to.include(mainContent);
  });

  it('should render "#main-content" in guidanceLayout.njk with tabindex="-1"', () => {

    const rendered = env.render('guidanceLayout.njk');

    expect(rendered).to.include(mainContent);
  });

});
