import { setupLoadCases } from './loadCases';
import { setupLoadCasesES } from './loadCasesES';
import { setupLoadHistoryV2 } from './loadHistoryV2';
import { setupOtherEventStartEvent } from './otherEventStartEvent';
import { setupOtherEventSubmitEvent } from './otherEventSubmitEvent';
import { setupStartAppealStartEvent } from './startAppealStartEvent';
import { setupStartAppealSubmitEvent } from './startAppealSubmitEvent';
import { setupStartRepresentingYourself } from './startRepresentingYourself';
import { setupTestHandler } from './test';

export default [
  setupLoadCases,
  setupLoadCasesES,
  setupLoadHistoryV2,
  setupOtherEventStartEvent,
  setupOtherEventSubmitEvent,
  setupStartAppealStartEvent,
  setupStartAppealSubmitEvent,
  setupStartRepresentingYourself,
  setupTestHandler
];
