const moment = require('moment');

const mockData = require('../mock-case-data');
const yearMonthDayFormat = 'YYYY-MM-DD';

function expiryDaysFromNow(days) {
  return moment().add(days,'days').format(yearMonthDayFormat);
}

module.exports = {
  path: '/caseworkers/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases/:caseId',
  method: 'GET',
  cache: false,
  template: params => {
    console.log(params);
    const caseData = mockData.startRepresentingYourself;
    const expiryDate = (params.caseId === '1111222233334444')
      ? expiryDaysFromNow(-10)
      : expiryDaysFromNow(10);
    caseData.id = params.caseId;
    caseData.case_data.appellantPinInPost.expiryDate = expiryDate;
    return caseData;
  }
};
