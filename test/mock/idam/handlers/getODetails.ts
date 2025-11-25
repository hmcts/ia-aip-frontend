import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

const defaultUserId = '1';
const emailToUserId: Record<string, string> = {
  'no-cases@example.com': '1',
  'has-case@example.com': '2',
  'appeal-submitted@example.com': '3',
  'awaiting-reasons-for-appeal@example.com': '4',
  'partial-awaiting-reasons-for-appeal@example.com': '5',
  'clarifying-questions@example.com': '6',
  'awaitingReasonsForAppeal-with-time_extension@example.com': '7',
  'awaitingClarifyingQuestions-with-time_extension@example.com': '8',
  'awaitingCmaRequirements@example.com': '9',
  'awaitingCmaRequirements-with-time_extension@example.com': '10',
  'cmaRequirementsSubmitted@example.com': '11',
  'cmaListed@example.com': '12',
  'outOfTimeDecisionGranted@example.com': '14',
  'outOfTimeDecisionRejected@example.com': '15',
  'outOfTimeDecisionInTime@example.com': '16',
  'preHearing@example.com': '17',
  'decided@example.com': '18',
  'ftpa-out-of-time-application-started@example.com': '19',
  'setupcase@example.com': '999'
};

export async function setupGetODetails(server: Mockttp) {
  await server.forGet('/o/userinfo').thenCallback(async () => {
    const email = cache.get('email');
    const uid = emailToUserId[email] || defaultUserId;
    return {
      status: 200,
      json: {
        uid,
        email,
        name: 'John Smith',
        forename: 'John',
        surname: 'Smith'
      }
    };
  });
}
