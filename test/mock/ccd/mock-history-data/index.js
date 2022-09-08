const appealSubmittedHistoryEvent = require('./data/appeal-submitted');
const awaitingReasonsForAppealHistoryEvent = require('./data/awaiting-reasons-for-appeal');
const partialAppealStartedHistoryEvent = require('./data/partial-appeal-started');
const partialAwaitingReasonsForAppealHistoryEvent = require('./data/partial-awaiting-reasons-for-appeal');
const submittedCmaRequirementsEvent = require('./data/submitted-cma-requirements');
const cmaListed = require('./data/cma-listed');
const endedAppealHistory = require('./data/ended-appeal')
const outOfTimeDecisionGranted = require('./data/out-of-time-decision-granted');
const outOfTimeDecisionRejected = require('./data/out-of-time-decision-rejected');
const outOfTimeDecisionInTime = require('./data/out-of-time-decision-in-time');
const uploadAddendumEvidence = require('./data/upload-addendum-evidence');

module.exports = {
  appealSubmittedHistoryEvent,
  partialAppealStartedHistoryEvent,
  awaitingReasonsForAppealHistoryEvent,
  partialAwaitingReasonsForAppealHistoryEvent,
  submittedCmaRequirementsEvent,
  cmaListed,
  endedAppealHistory,
  outOfTimeDecisionGranted,
  outOfTimeDecisionRejected,
  outOfTimeDecisionInTime,
  uploadAddendumEvidence
};
