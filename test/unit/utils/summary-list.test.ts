import { addSummaryRow, Delimiter } from '../../../app/utils/summary-list';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('JWT Utils', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the expected object', () => {

    const result = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [ 'value1', 'value2' ], '/href', Delimiter.BREAK_LINE);

    const expectedResponse = {
      'key': { 'text': 'Name' },
      'value': { 'html': 'value1<br>value2' },
      'actions': { 'items': [ { 'href': '/href', 'text': 'Change' } ] }
    };

    expect(result).to.deep.equal(expectedResponse);
  });

  it('should return the expected object using the SPACE specified Delimiter', () => {

    const result = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [ 'value1', 'value2' ], '/href', Delimiter.SPACE);

    const expectedResponse = {
      'key': { 'text': 'Name' },
      'value': { 'html': 'value1 value2' },
      'actions': { 'items': [ { 'href': '/href', 'text': 'Change' } ] }
    };

    expect(result).to.deep.equal(expectedResponse);
  });

  it('should return the expected object using the BREAK_LINE specified Delimiter', () => {

    const result = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [ 'value1', 'value2' ], '/href', Delimiter.BREAK_LINE);

    const expectedResponse = {
      'key': { 'text': 'Name' },
      'value': { 'html': 'value1<br>value2' },
      'actions': { 'items': [ { 'href': '/href', 'text': 'Change' } ] }
    };

    expect(result).to.deep.equal(expectedResponse);
  });
});
