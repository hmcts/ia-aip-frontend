import i18n from '../../locale/en.json';

export const getGuidancePageText = (pageText: string) => {
  switch (pageText) {
    case 'caseworker':
      return i18n.pages.guidancePages.caseWorker;
    case 'homeOfficeDocuments':
      return i18n.pages.guidancePages.homeOfficeDocuments;
    case 'helpWithAppeal':
      return i18n.pages.guidancePages.helpWithAppeal;
    case 'evidenceToSupportAppeal':
      return i18n.pages.guidancePages.evidenceToSupportAppeal;
    case 'whatToExpectAtHearing':
      return i18n.pages.guidancePages.whatToExpectAtHearing;
    case 'understandingHearingBundle':
      return i18n.pages.guidancePages.understandingHearingBundle;
    default:
      return false;
  }
};
