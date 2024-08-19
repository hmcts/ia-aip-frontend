import nunjucks from 'nunjucks';
import i18n from '../../../../../locale/en.json';
const { expect } = require('chai');
const govUK = require('govuk-frontend');

describe('Delete evidence button', () => {
//   var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
  const env = nunjucks.configure([
    'node_modules/govuk-frontend',
    'views'
  ]);

  env.addFilter('eval', function(text: string) {
    return nunjucks.renderString(text, this.ctx);
  });

  const data = {
    evidence: {
      name: 'Document 1'
    }
  };
  env.addGlobal('i18n', i18n);
  it('should render the delete link with hidden screen reader text', () => {
    const rendered = env.render('appeal-application/home-office/appeal-late.njk', data);
    const screenreadableLink = '<button type="submit" class="evidence-list__link" value="Delete" formaction="?_csrf=">Delete<span class="govuk-visually-hidden"> Document 1</span></button>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });
});
