import { getGuidancePageText } from '../../../app/utils/guidance-page-utils';
import i18n from '../../../locale/en.json';
import { expect } from '../../utils/testUtils';

describe('guidance-page-utils @thisOnes', () => {
  it('When I enter caseworker I get the text for caseworker Page', () => {
    const result = getGuidancePageText('caseworker');
    expect(result).to.deep.equal(i18n.pages.guidancePages.caseWorker);
  });

  it('When I enter homeOfficeDocuments I get the text for homeOfficeDocuments Page', () => {
    const result = getGuidancePageText('homeOfficeDocuments');
    expect(result).to.deep.equal(i18n.pages.guidancePages.homeOfficeDocuments);
  });

  it('When I enter helpWithAppeal I get the text for helpWithAppeal Page', () => {
    const result = getGuidancePageText('helpWithAppeal');
    expect(result).to.deep.equal(i18n.pages.guidancePages.helpWithAppeal);
  });

  it('When I enter evidenceToSupportAppeal I get the text for evidenceToSupportAppeal Page', () => {
    const result = getGuidancePageText('evidenceToSupportAppeal');
    expect(result).to.deep.equal(i18n.pages.guidancePages.evidenceToSupportAppeal);
  });
});
