const mockData = require('../mock-case-data');

const usersToCaseData = {
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
  '35': [mockData.outOfTimeDecisionInTime]
};

module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases',
  method: 'GET',
  cache: false,
  template: params => {
    return usersToCaseData[params.userId];
  }
};
