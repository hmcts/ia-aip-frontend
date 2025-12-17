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
  '19': mockData.ftpaOutOfTimeApplicationStartedES,
  '32': mockData.endedAppealES,
  '33': mockData.outOfTimeDecisionGrantedES,
  '34': mockData.outOfTimeDecisionRejectedES,
  '35': mockData.outOfTimeDecisionInTimeES
};

module.exports = {
  path: '/searchCases',
  method: 'POST',
  cache: false,
  template: (params, query, body, options, headers) => {
    return usersToCaseData[headers['userid']];
  }
};
