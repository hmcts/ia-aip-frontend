import { Mockttp } from 'mockttp';
import mockData from '../mock-case-data';

const usersToCaseData: Record<string, any[]> = {
  '1': [],
  '2': [mockData.partialAppealStartedCaseData],
  '3': [mockData.appealSubmittedCaseData],
  '4': [mockData.awaitingReasonsForAppealCaseData],
  '5': [mockData.partialAwaitingReasonsForAppealCaseData],
  '6': [mockData.clarifyingQuestionsCaseData],
  '7': [mockData.awaitingReasonsForAppealCaseDataWithTimeExtension],
  '8': [mockData.clarifyingQuestionsCaseDataWithTimeExtensions],
  '9': [mockData.awaitingCmaRequirements],
  '10': [mockData.awaitingCmaRequirementsWithTimeExtensions],
  '11': [mockData.submittedCmaRequirements],
  '12': [mockData.cmaListed],
  '14': [mockData.outOfTimeDecisionGranted],
  '15': [mockData.outOfTimeDecisionRejected],
  '16': [mockData.outOfTimeDecisionInTime],
  '17': [mockData.uploadAddendumEvidence],
  '18': [mockData.decided],
  '19': [mockData.ftpaOutOfTimeApplicationStarted],
  '21': [mockData.appealWithHomeOfficeReference],
  '22': [mockData.appealWithHomeOfficeDetails],
  '23': [mockData.appealWithHomeOfficeDetailsAndName],
  '24': [mockData.appealWithHomeOfficeDetailsNameAndDateOfBirth],
  '25': [mockData.appealWithHomeOfficeDetailsNameDateOfBirthAndNationality],
  '26': [mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress],
  '28': [mockData.outOfTimeAppealWithReasonForBeingLateAnEvidence],
  '29': [mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal],
  '30': [mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal],
  '31': [mockData.euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal],
  '32': [mockData.endedAppeal],
  '33': [mockData.outOfTimeDecisionGranted],
  '34': [mockData.outOfTimeDecisionRejected],
  '35': [mockData.outOfTimeDecisionInTime],
  '36': [mockData.appealUpToFeeChoice]
};

export async function setupLoadCases(server: Mockttp) {
  await server.forGet(
    /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases/
  ).thenCallback(async (request) => {
    const match = request.path.match(
      /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases/
    );
    const userId = match ? match[1] : undefined;
    if (!userId) {
      return {
        statusCode: 400,
        json: { error: 'Missing userId param' }
      };
    }
    return {
      statusCode: 200,
      json: usersToCaseData[userId] ?? []
    };
  });
}
