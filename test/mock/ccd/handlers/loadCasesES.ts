import { Mockttp } from 'mockttp';
import mockData from '../mock-case-data';

const dataToES = (data) => {
  return {
    'total': 1,
    'cases': [data]
  };
};

const usersToCaseData: Record<string, any> = {
  '1': {},
  '2': dataToES(mockData.partialAppealStartedCaseData),
  '3': dataToES(mockData.appealSubmittedCaseData),
  '4': dataToES(mockData.awaitingReasonsForAppealCaseData),
  '5': dataToES(mockData.partialAwaitingReasonsForAppealCaseData),
  '6': dataToES(mockData.clarifyingQuestionsCaseData),
  '7': dataToES(mockData.awaitingReasonsForAppealCaseDataWithTimeExtension),
  '8': dataToES(mockData.clarifyingQuestionsCaseDataWithTimeExtensions),
  '9': dataToES(mockData.awaitingCmaRequirements),
  '10': dataToES(mockData.awaitingCmaRequirementsWithTimeExtensions),
  '11': dataToES(mockData.submittedCmaRequirements),
  '12': dataToES(mockData.cmaListed),
  '14': dataToES(mockData.outOfTimeDecisionGranted),
  '15': dataToES(mockData.outOfTimeDecisionRejected),
  '16': dataToES(mockData.outOfTimeDecisionInTime),
  '17': dataToES(mockData.uploadAddendumEvidence),
  '18': dataToES(mockData.decided),
  '19': dataToES(mockData.ftpaOutOfTimeApplicationStarted),
  '21': dataToES(mockData.appealWithHomeOfficeReference),
  '22': dataToES(mockData.appealWithHomeOfficeDetails),
  '23': dataToES(mockData.appealWithHomeOfficeDetailsAndName),
  '24': dataToES(mockData.appealWithHomeOfficeDetailsNameAndDateOfBirth),
  '25': dataToES(mockData.appealWithHomeOfficeDetailsNameDateOfBirthAndNationality),
  '26': dataToES(mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress),
  '28': dataToES(mockData.outOfTimeAppealWithReasonForBeingLateAnEvidence),
  '29': dataToES(mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal),
  '30': dataToES(mockData.appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal),
  '31': dataToES(mockData.euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal),
  '32': dataToES(mockData.endedAppeal),
  '33': dataToES(mockData.outOfTimeDecisionGranted),
  '34': dataToES(mockData.outOfTimeDecisionRejected),
  '35': dataToES(mockData.outOfTimeDecisionInTime),
  '36': dataToES(mockData.appealUpToFeeChoice),
  '37': dataToES(mockData.appealSubmittedSTF24W),
  '38': dataToES(mockData.lateAppealSubmittedSTF24W),
  '39': dataToES(mockData.awaitingRespondentEvidenceSTF24W),
  '40': dataToES(mockData.listingSTF24W),
  '41': dataToES(mockData.awaitingReasonsForAppealSTF24W),
  '42': dataToES(mockData.reasonsForAppealSubmittedSTF24W),
  '43': dataToES(mockData.caseUnderReviewSTF24W),
  '44': dataToES(mockData.respondentReviewSTF24W),
  '45': dataToES(mockData.decisionMaintainedSTF24W),
  '46': dataToES(mockData.awaitingReasonsForAppealPartialSTF24W),
  '47': dataToES(mockData.prepareForHearingSTF24W),
  '48': dataToES(mockData.finalBundlingSTF24W),
  '49': dataToES(mockData.pendingPaymentSTF24W),
  '50': dataToES(mockData.submitHearingRequirementsSTF24W),
  '51': dataToES(mockData.clarifyingQuestionsSTF24W),
  '52': dataToES(mockData.startAppealUpToHasSponsorOrNlr),
  '53': dataToES(mockData.appealSubmittedWithNlrEmailWithoutSponsor),
  '54': dataToES(mockData.appealSubmittedWithNlrEmailWithSponsor),
  '55': dataToES(mockData.appealSubmittedWithNlrDetails),
  '56': dataToES(mockData.appealSubmittedWithNlrDetails),
  '57': dataToES(mockData.appealSubmittedWithNlrId),
  '58': dataToES(mockData.appealSubmittedWithNlrId),
  '59': dataToES(mockData.appealSubmittedWithNlrIdWithSponsor),
  '60': dataToES(mockData.appealSubmittedCaseData),
  '61': dataToES(mockData.appealSubmittedWithNlrIdWithSponsor2),
  '62': dataToES(mockData.appealSubmittedWithNlrId2),
  '63': dataToES(mockData.appealSubmittedWithNlrId3),
  '64': dataToES(mockData.appealSubmittedWithNlrId),
  '65': dataToES(mockData.startAppealUpToHasSponsorOrNlr),
  '66': dataToES(mockData.startAppealUpToHasSponsorOrNlr),
  '67': dataToES(mockData.startAppealUpToHasSponsorOrNlr),
  '100': mockData.multipleAppealsES,
  '101': mockData.multipleAppealsNlrES,
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
