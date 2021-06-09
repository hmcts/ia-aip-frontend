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
  outOfTimeDecisionGranted,
  outOfTimeDecisionRejected,
  outOfTimeDecisionInTime
};
