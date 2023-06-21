const mockData = require('../mock-history-data');

const caseIdToHistory = {
  '1': { auditEvents: [] },
  '2': mockData.partialAppealStartedHistoryEvent,
  '3': mockData.appealSubmittedHistoryEvent,
  '4': mockData.awaitingReasonsForAppealHistoryEvent,
  '5': mockData.partialAwaitingReasonsForAppealHistoryEvent,
  '7': mockData.awaitingReasonsForAppealHistoryEvent,
  '11': mockData.submittedCmaRequirementsEvent,
  '12': mockData.cmaListed,
  '13': mockData.endedAppealHistory,
  '14': mockData.outOfTimeDecisionGranted,
  '15': mockData.outOfTimeDecisionRejected,
  '16': mockData.outOfTimeDecisionInTime,
  '17': mockData.uploadAddendumEvidence,
  '18': mockData.decided
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
