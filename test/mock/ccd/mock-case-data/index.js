const appealSubmittedCaseData = require('./data/appeal-submitted');
const awaitingReasonsForAppealCaseData = require('./data/awaiting-reasons-for-appeal');
const awaitingReasonsForAppealCaseDataWithTimeExtension = require('./data/awaiting-reasons-for-appeal-with-time-extension');
const partialAppealStartedCaseData = require('./data/partial-appeal-started');
const partialAwaitingReasonsForAppealCaseData = require('./data/partial-awaiting-reasons-for-appeal');
const clarifyingQuestionsCaseData = require('./data/clarifying-questions');
const clarifyingQuestionsCaseDataWithTimeExtensions = require('./data/clarifying-questions-with-time-extensions');

module.exports = {
  appealSubmittedCaseData,
  partialAppealStartedCaseData,
  awaitingReasonsForAppealCaseData,
  partialAwaitingReasonsForAppealCaseData,
  awaitingReasonsForAppealCaseDataWithTimeExtension,
  clarifyingQuestionsCaseData,
  clarifyingQuestionsCaseDataWithTimeExtensions
};
