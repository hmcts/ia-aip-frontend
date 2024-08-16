import nunjucks from 'nunjucks';
import i18n from '../../../../locale/en.json';
const { expect } = require('chai');

describe('evidenceList macro', () => {
  const env = nunjucks.configure('views/components');
  const template = `
    {% from "evidence-list.njk" import evidenceList %}
    {{ evidenceList(evidences, cta) }}
    `;
  const data = {
    evidences: [
      { fileId: '123', name: 'Document 1' }
    ],
    cta: '/delete-document'
  };
  env.addGlobal('i18n', i18n);
  it('should render the delete link with hidden screen reader text', () => {
    const rendered = env.renderString(template, data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.cta + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });
});
