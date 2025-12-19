const partialAppealStartedCaseData = require('./data/partial-appeal-started');
const appealSubmittedCaseData = require('./data/appeal-submitted');
const awaitingReasonsForAppealCaseData = require('./data/awaiting-reasons-for-appeal');
const awaitingReasonsForAppealCaseDataWithTimeExtension = require('./data/awaiting-reasons-for-appeal-with-time-extension');
const partialAwaitingReasonsForAppealCaseData = require('./data/partial-awaiting-reasons-for-appeal');
const clarifyingQuestionsCaseData = require('./data/clarifying-questions');
const clarifyingQuestionsCaseDataWithTimeExtensions = require('./data/clarifying-questions-with-time-extensions');
const awaitingCmaRequirements = require('./data/awaiting-cma-requirements');
const awaitingCmaRequirementsWithTimeExtensions = require('./data/awaiting-cma-requirements-with-time-extensions');
const submittedCmaRequirements = require('./data/submitted-cma-requirements');
const cmaListed = require('./data/cmaListed');
const endedAppeal = require('./data/endedAppeal');
const outOfTimeDecisionGranted = require('./data/out-of-time-decision-granted');
const outOfTimeDecisionRejected = require('./data/out-of-time-decision-rejected');
const outOfTimeDecisionInTime = require('./data/out-of-time-decision-in-time');
const uploadAddendumEvidence = require('./data/upload-addendum-evidence');
const decided = require('./data/decided');
const ftpaOutOfTimeApplicationStarted = require('./data/ftpa-out-of-time-application-started');
const startRepresentingYourself = require('./data/start-representing-yourself');
const appealWithHomeOfficeReference = require('./data/appealWithHomeOfficeReference');
const appealWithHomeOfficeDetails = require('./data/appealWithHomeOfficeDetails');
const appealWithHomeOfficeDetailsAndName = require('./data/appealWithHomeOfficeDetailsAndName');
const appealWithHomeOfficeDetailsNameAndDateOfBirth = require('./data/appealWithHomeOfficeDetailsNameAndDateOfBirth');
const appealWithHomeOfficeDetailsNameDateOfBirthAndNationality = require('./data/appealWithHomeOfficeDetailsNameDateOfBirthAndNationality');
const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress = require('./data/appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress');
const outOfTimeAppealWithReasonForBeingLateAnEvidence = require('./data/outOfTimeAppealWithReasonForBeingLateAnEvidence');
const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal = require('./data/appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal');
const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal = require('./data/appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal');
const euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal = require('./data/euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal');
const appealUpToFeeChoice =  require('./data/appealUpToFeeChoice');
const partialAppealStartedCaseDataES = require('./data/partial-appeal-started-es');
const appealSubmittedCaseDataES = require('./data/appeal-submitted-es');
const awaitingReasonsForAppealCaseDataES = require('./data/awaiting-reasons-for-appeal-es');
const awaitingReasonsForAppealCaseDataWithTimeExtensionES = require('./data/awaiting-reasons-for-appeal-with-time-extension-es');
const partialAwaitingReasonsForAppealCaseDataES = require('./data/partial-awaiting-reasons-for-appeal-es');
const clarifyingQuestionsCaseDataES = require('./data/clarifying-questions-es');
const clarifyingQuestionsCaseDataWithTimeExtensionsES = require('./data/clarifying-questions-with-time-extensions-es');
const awaitingCmaRequirementsES = require('./data/awaiting-cma-requirements-es');
const awaitingCmaRequirementsWithTimeExtensionsES = require('./data/awaiting-cma-requirements-with-time-extensions-es');
const submittedCmaRequirementsES = require('./data/submitted-cma-requirements-es');
const cmaListedES = require('./data/cmaListed-es');
const endedAppealES = require('./data/endedAppeal-es');
const outOfTimeDecisionGrantedES = require('./data/out-of-time-decision-granted-es');
const outOfTimeDecisionRejectedES = require('./data/out-of-time-decision-rejected-es');
const outOfTimeDecisionInTimeES = require('./data/out-of-time-decision-in-time-es');
const uploadAddendumEvidenceES = require('./data/upload-addendum-evidence-es');
const decidedES = require('./data/decided-es');
const ftpaOutOfTimeApplicationStartedES = require('./data/ftpa-out-of-time-application-started-es');
const appealWithHomeOfficeReferenceES =  require('./data/appealWithHomeOfficeReference-es');
const appealWithHomeOfficeDetailsES =  require('./data/appealWithHomeOfficeDetails-es');
const appealWithHomeOfficeDetailsAndNameES =  require('./data/appealWithHomeOfficeDetailsAndName-es');
const appealWithHomeOfficeDetailsNameAndDateOfBirthES =  require('./data/appealWithHomeOfficeDetailsNameAndDateOfBirth-es');
const appealWithHomeOfficeDetailsNameDateOfBirthAndNationalityES =  require('./data/appealWithHomeOfficeDetailsNameDateOfBirthAndNationality-es');
const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddressES =  require('./data/appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress-es');
const outOfTimeAppealWithReasonForBeingLateAnEvidenceES =  require('./data/outOfTimeAppealWithReasonForBeingLateAnEvidence-es');
const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES =  require('./data/appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal-es');
const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppealES =  require('./data/appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal-es');
const euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES =  require('./data/euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal-es');
const appealUpToFeeChoiceES =  require('./data/appealUpToFeeChoice-es');

module.exports = {
  partialAppealStartedCaseData,
  appealSubmittedCaseData,
  awaitingReasonsForAppealCaseData,
  awaitingReasonsForAppealCaseDataWithTimeExtension,
  partialAwaitingReasonsForAppealCaseData,
  clarifyingQuestionsCaseData,
  clarifyingQuestionsCaseDataWithTimeExtensions,
  awaitingCmaRequirements,
  awaitingCmaRequirementsWithTimeExtensions,
  submittedCmaRequirements,
  cmaListed,
  endedAppeal,
  endedAppealES,
  outOfTimeDecisionGranted,
  outOfTimeDecisionRejected,
  outOfTimeDecisionInTime,
  uploadAddendumEvidence,
  decided,
  ftpaOutOfTimeApplicationStarted,
  startRepresentingYourself,
  appealWithHomeOfficeReference,
  appealWithHomeOfficeDetails,
  appealWithHomeOfficeDetailsAndName,
  appealWithHomeOfficeDetailsNameAndDateOfBirth,
  appealWithHomeOfficeDetailsNameDateOfBirthAndNationality,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress,
  outOfTimeAppealWithReasonForBeingLateAnEvidence,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal,
  euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal,
  appealUpToFeeChoice,
  partialAppealStartedCaseDataES,
  appealSubmittedCaseDataES,
  awaitingReasonsForAppealCaseDataES,
  partialAwaitingReasonsForAppealCaseDataES,
  clarifyingQuestionsCaseDataES,
  awaitingReasonsForAppealCaseDataWithTimeExtensionES,
  clarifyingQuestionsCaseDataWithTimeExtensionsES,
  awaitingCmaRequirementsES,
  awaitingCmaRequirementsWithTimeExtensionsES,
  submittedCmaRequirementsES,
  cmaListedES,
  outOfTimeDecisionGrantedES,
  outOfTimeDecisionRejectedES,
  outOfTimeDecisionInTimeES,
  uploadAddendumEvidenceES,
  decidedES,
  ftpaOutOfTimeApplicationStartedES,
  appealWithHomeOfficeReferenceES,
  appealWithHomeOfficeDetailsES,
  appealWithHomeOfficeDetailsAndNameES,
  appealWithHomeOfficeDetailsNameAndDateOfBirthES,
  appealWithHomeOfficeDetailsNameDateOfBirthAndNationalityES,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddressES,
  outOfTimeAppealWithReasonForBeingLateAnEvidenceES,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppealES,
  euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES,
  appealUpToFeeChoiceES
};
