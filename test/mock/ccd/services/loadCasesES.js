const mockData = require('../mock-case-data');
const cache = require('memory-cache');

const usersToCaseData = {
  '1': {},
  '2': mockData.partialAppealStartedCaseDataES,
  '3': mockData.appealSubmittedCaseDataES,
  '4': mockData.awaitingReasonsForAppealCaseDataES,
  '5': mockData.partialAwaitingReasonsForAppealCaseDataES,
  '6': mockData.clarifyingQuestionsCaseDataES,
  '7': mockData.awaitingReasonsForAppealCaseDataWithTimeExtensionES,
  '8': mockData.clarifyingQuestionsCaseDataWithTimeExtensionsES,
  '9': mockData.awaitingCmaRequirementsES,
  '10': mockData.awaitingCmaRequirementsWithTimeExtensionsES,
  '11': mockData.submittedCmaRequirementsES,
  '12': mockData.cmaListedES,
  '14': mockData.outOfTimeDecisionGrantedES,
  '15': mockData.outOfTimeDecisionRejectedES,
  '16': mockData.outOfTimeDecisionInTimeES,
  '17': mockData.uploadAddendumEvidenceES,
  '18': mockData.decidedES,
  '19': mockData.ftpaOutOfTimeApplicationStartedES
};

module.exports = {
  path: '/searchCases',
  method: 'POST',
  cache: false,
  template: (params, query, body, options, headers) => {
    const uid = headers['userid'];
    if (['20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35'].includes(uid)) {
      const caseData = cache.get(`caseData${uid}`);
      if (caseData) {
        return {
          "total": 1,
          "cases": caseData
        };
      }
      return {};
    } else {
      return usersToCaseData[headers['userid']];
    }
  }
};
