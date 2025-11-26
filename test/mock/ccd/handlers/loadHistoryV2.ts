import { Mockttp } from 'mockttp';
import { mockData } from '../mock-history-data';

const caseIdToHistory: Record<string, any> = {
  '1': { auditEvents: [] },
  '11': mockData.submittedCmaRequirementsEvent,
  '12': mockData.cmaListed,
  '13': mockData.endedAppealHistory,
  '14': mockData.outOfTimeDecisionGranted,
  '15': mockData.outOfTimeDecisionRejected,
  '16': mockData.outOfTimeDecisionInTime,
  '17': mockData.uploadAddendumEvidence,
  // '18': mockData.decided,
  '2': mockData.partialAppealStartedHistoryEvent,
  '3': mockData.appealSubmittedHistoryEvent,
  '4': mockData.awaitingReasonsForAppealHistoryEvent,
  '5': mockData.partialAwaitingReasonsForAppealHistoryEvent,
  '7': mockData.awaitingReasonsForAppealHistoryEvent
};

export async function setupLoadHistoryV2(server: Mockttp) {
  await server.forGet(/\/cases\/([^/]+)\/events/).thenCallback(async (request) => {
    const match = request.path.match(/\/cases\/([^/]+)\/events/);
    const caseId = match ? match[1] : '1';
    return {
      status: 200,
      json: caseIdToHistory[caseId] ?? caseIdToHistory['1']
    };
  });
}
