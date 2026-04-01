import { Mockttp } from 'mockttp';
import cache from '../../cache';

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
  'appealWithHomeOfficeReference@example.com': '21',
  'appealWithHomeOfficeDetails@example.com': '22',
  'appealWithHomeOfficeDetailsAndName@example.com': '23',
  'appealWithHomeOfficeDetailsNameAndDateOfBirth@example.com': '24',
  'appealWithHomeOfficeDetailsNameDateOfBirthAndNationality@example.com': '25',
  'appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress@example.com': '26',
  'outOfTimeAppealWithReasonForBeingLateAnEvidence@example.com': '28',
  'appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal@example.com': '29',
  'appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal@example.com': '30',
  'euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal@example.com': '31',
  'endedAppeal@example.com': '32',
  'outOfTimeGrantedDecisionAppeal@example.com': '33',
  'outOfTimeRejectedDecisionAppeal@example.com': '34',
  'outOfTimeInTimeDecisionAppeal@example.com': '35',
  'appealUpToFeeChoice@example.com': '36',
  'multiple-appeals@example.com': '100',
  'appeal-submitted-stf24w@example.com': '37',
  'late-appeal-submitted-stf24w@example.com': '38',
  'awaiting-respondent-evidence-stf24w@example.com': '39',
  'listing-stf24w@example.com': '40',
  'awaiting-reasons-for-appeal-stf24w@example.com': '41',
  'reasons-for-appeal-submitted-stf24w@example.com': '42',
  'case-under-review-stf24w@example.com': '43',
  'respondent-review-stf24w@example.com': '44',
  'decision-maintained-stf24w@example.com': '45',
  'awaiting-reasons-for-appeal-partial-stf24w@example.com': '46',
  'setupcase@example.com': '999'
};

export async function setupGetODetails(server: Mockttp) {
  await server.forGet('/o/userinfo').thenCallback(async () => {
    const email = cache.get('email');
    const uid = emailToUserId[email] || defaultUserId;
    return {
      statusCode: 200,
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
