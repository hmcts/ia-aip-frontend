import appealSubmittedHistoryEvent from './data/appeal-submitted';
import awaitingReasonsForAppealHistoryEvent from './data/awaiting-reasons-for-appeal';
import cmaListed from './data/cma-listed';
import endedAppealHistory from './data/ended-appeal';
import outOfTimeDecisionGranted from './data/out-of-time-decision-granted';
import outOfTimeDecisionInTime from './data/out-of-time-decision-in-time';
import outOfTimeDecisionRejected from './data/out-of-time-decision-rejected';
import partialAppealStartedHistoryEvent from './data/partial-appeal-started';
import partialAwaitingReasonsForAppealHistoryEvent from './data/partial-awaiting-reasons-for-appeal';
import submittedCmaRequirementsEvent from './data/submitted-cma-requirements';
import uploadAddendumEvidence from './data/upload-addendum-evidence';

export const mockData = {
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
