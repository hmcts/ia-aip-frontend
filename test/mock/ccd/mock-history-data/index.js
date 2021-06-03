const appealSubmittedHistoryEvent = require('./data/appeal-submitted');
const awaitingReasonsForAppealHistoryEvent = require('./data/awaiting-reasons-for-appeal');
const partialAppealStartedHistoryEvent = require('./data/partial-appeal-started');
const partialAwaitingReasonsForAppealHistoryEvent = require('./data/partial-awaiting-reasons-for-appeal');
const submittedCmaRequirementsEvent = require('./data/submitted-cma-requirements');
const cmaListed = require('./data/cma-listed');
const endedAppealHistory = require('./data/ended-appeal')

module.exports = {
  appealSubmittedHistoryEvent,
  partialAppealStartedHistoryEvent,
  awaitingReasonsForAppealHistoryEvent,
  partialAwaitingReasonsForAppealHistoryEvent,
  submittedCmaRequirementsEvent,
  cmaListed,
  endedAppealHistory
};
