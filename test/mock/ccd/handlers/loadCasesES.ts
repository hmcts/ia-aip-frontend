import cache from 'memory-cache';
import { Mockttp } from 'mockttp';
import mockData from '../mock-case-data';

const usersToCaseData: Record<string, any> = {
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

export async function setupLoadCasesES(server: Mockttp) {
  await server.forPost('/searchCases').thenCallback(async (request) => {
    const userid = request.headers['userid'];
    if (userid === '999') {
      const caseData = cache.get('caseData');
      if (caseData) {
        return {
          status: 200,
          json: {
            total: 1,
            cases: caseData
          }
        };
      }
      return {
        status: 200,
        json: {}
      };
    }
    return {
      status: 200,
      json: usersToCaseData[userid as string] ?? {}
    };
  });
}
