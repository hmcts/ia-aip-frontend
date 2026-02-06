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
  '36': [mockData.appealUpToFeeChoice],
  '100': [mockData.multipleAppealCase1001, mockData.multipleAppealCase1002, mockData.multipleAppealCase1003]
};

export async function setupLoadCases(server: Mockttp) {
  // Handler for loading a single case by ID
  await server.forGet(
    /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/(\d+)$/
  ).thenCallback(async (request) => {
    const match = request.url.match(
      /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases\/(\d+)$/
    );
    const caseId = match ? match[4] : undefined;
    if (!caseId) {
      return {
        statusCode: 400,
        json: { error: 'Missing caseId param' }
      };
    }
    // Search all cases across all users to find the case by ID
    const allCases = Object.values(usersToCaseData).flat();
    const caseData = allCases.find((c: any) => String(c.id) === caseId);
    if (caseData) {
      return {
        statusCode: 200,
        json: caseData
      };
    }
    return {
      statusCode: 404,
      json: { error: 'Case not found' }
    };
  });

  // Handler for listing all cases for a user
  await server.forGet(
    /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases$/
  ).thenCallback(async (request) => {
    const match = request.url.match(
      /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/cases$/
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
