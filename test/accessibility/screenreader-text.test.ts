import nunjucks from 'nunjucks';
import i18n from '../../locale/en.json';
const { expect } = require('chai');

describe('Screenreader text on "Delete" links', () => {

  const env = nunjucks.configure([
    'node_modules/govuk-frontend',
    'views'
  ]);

  env.addFilter('eval', function(text: string) {
    return nunjucks.renderString(text, this.ctx);
  });

  env.addGlobal('i18n', i18n);

  it('should render the delete link with hidden screen reader text using the evidence-list macro', () => {
    const template = `
    {% from "components/evidence-list.njk" import evidenceList %}
    {{ evidenceList(evidences, cta) }}
    `;
    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      cta: '/delete-document'
    };
    const rendered = env.renderString(template, data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.cta + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text using the evidence-list-with-dynamic-title macro', () => {
    const template = `
    {% from "components/evidence-list-with-dynamic-title.njk" import evidenceList %}
    {{ evidenceList(evidences, cta, title) }}
    `;
    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      cta: '/delete-document',
      title: 'List of files'
    };
    const rendered = env.renderString(template, data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.cta + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on appeal-late', () => {

    const data = {
      evidence: {
        name: 'Document 1'
      }
    };

    const rendered = env.render('appeal-application/home-office/appeal-late.njk', data);
    const screenreadableLink = '<button type="submit" class="evidence-list__link" value="Delete" formaction="?_csrf=">Delete<span class="govuk-visually-hidden"> Document 1</span></button>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on upload-local-authority-letter', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('appeal-application/fee-support/upload-local-authority-letter.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on document-upload-page', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('ftpa-application/document-upload-page.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on supporting-evidence-upload-page (make-application)', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('make-application/supporting-evidence-upload-page.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on supporting-evidence-upload-page (reasons-for-appeal)', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('reasons-for-appeal/supporting-evidence-upload-page.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on supporting-evidence-upload-page (upload-evidence)', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('upload-evidence/supporting-evidence-upload-page.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on evidence-upload-page', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('upload-evidence/evidence-upload-page.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });

  it('should render the delete link with hidden screen reader text on multiple-evidence-upload-page', () => {

    const data = {
      evidences: [
        { fileId: '123', name: 'Document 1' }
      ],
      evidenceCTA: '/delete-document'
    };

    const rendered = env.render('templates/multiple-evidence-upload-page.njk', data);
    const screenreadableLink = '<a class="govuk-link" href="' + data.evidenceCTA + '?id=' + data.evidences[0].fileId + '">Delete<span class="govuk-visually-hidden"> ' + data.evidences[0].name + '</span></a>';

    expect(rendered).to.include(screenreadableLink);
    expect(rendered).to.include('class="govuk-visually-hidden"');
  });
});
