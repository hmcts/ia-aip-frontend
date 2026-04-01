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
  '19': mockData.ftpaOutOfTimeApplicationStartedES,
  '21': mockData.appealWithHomeOfficeReferenceES,
  '22': mockData.appealWithHomeOfficeDetailsES,
  '23': mockData.appealWithHomeOfficeDetailsAndNameES,
  '24': mockData.appealWithHomeOfficeDetailsNameAndDateOfBirthES,
  '25': mockData.appealWithHomeOfficeDetailsNameDateOfBirthAndNationalityES,
  '26': mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddressES,
  '28': mockData.outOfTimeAppealWithReasonForBeingLateAnEvidenceES,
  '29': mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES,
  '30': mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppealES,
  '31': mockData.euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES,
  '32': mockData.endedAppealES,
  '33': mockData.outOfTimeDecisionGrantedES,
  '34': mockData.outOfTimeDecisionRejectedES,
  '35': mockData.outOfTimeDecisionInTimeES,
  '36': mockData.appealUpToFeeChoiceES,
  '37': mockData.appealSubmittedSTF24WES,
  '38': mockData.lateAppealSubmittedSTF24WES,
  '39': mockData.awaitingRespondentEvidenceSTF24WES,
  '40': mockData.listingSTF24WES,
  '41': mockData.awaitingReasonsForAppealSTF24WES,
  '100': mockData.multipleAppealsES,
  '42': mockData.reasonsForAppealSubmittedSTF24WES,
  '43': mockData.caseUnderReviewSTF24WES,
  '44': mockData.respondentReviewSTF24WES,
  '45': mockData.decisionMaintainedSTF24WES,
  '46': mockData.awaitingReasonsForAppealPartialSTF24WES,
};

export async function setupLoadCasesES(server: Mockttp) {
  await server.forPost('/searchCases').thenCallback(async (request) => {
    const userid = request.headers['userid'];
    return {
      statusCode: 200,
      json: usersToCaseData[userid as string] ?? {}
    };
  });
}
