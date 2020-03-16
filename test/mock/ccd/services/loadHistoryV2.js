const mockData = require('../mock-case-data');

const caseIdToHistory = {
  '1': [ { auditEvents: [] } ],
  '2': [ mockData.partialAppealStartedCaseData ],
  '3': [ mockData.appealSubmittedCaseData ],
  '4': [ mockData.awaitingReasonsForAppealCaseData ],
  '5': [ mockData.partialAwaitingReasonsForAppealCaseData ]
};

module.exports = {
  path: '/cases/:caseId/events',
  method: 'GET',
  cache: false,
  template: params => {
    if (caseIdToHistory[params.caseId]) {
      return caseIdToHistory[params.caseId];
    } else {
      return caseIdToHistory['1'];
    }
  }
};
