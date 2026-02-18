import config from 'config';

import { createLegalRepCase, getAppealState, getSecurityHeaders, updateAppeal } from './ccd-service';
import {
  getCitizenUserFromThread,
  getUserId,
  UserInfo
} from './user-service';
const events = require('./case-events/index.js');

enum State {
  appealStarted = 'appealStarted',
  appealSubmitted = 'appealSubmitted',
  pendingPayment = 'pendingPayment',
  ended = 'ended',
  awaitingRespondentEvidence = 'awaitingRespondentEvidence',
  awaitingReasonsForAppeal = 'awaitingReasonsForAppeal',
  reasonsForAppealSubmitted = 'reasonsForAppealSubmitted',
  awaitingClarifyingQuestionsAnswers = 'awaitingClarifyingQuestionsAnswers',
  respondentReview = 'respondentReview',
  submitHearingRequirements = 'submitHearingRequirements',
  listing = 'listing',
  prepareForHearing = 'prepareForHearing',
  finalBundling = 'finalBundling',
  preHearing = 'preHearing',
  decision = 'decision',
  decided = 'decided'
}

const caseOfficerUserName: string = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword: string = process.env.TEST_CASEOFFICER_PASSWORD;
const adminOfficerUserName: string = config.get('testAccounts.testAdminOfficerUserName');
const adminOfficerPassword: string = process.env.TEST_ADMINOFFICER_PASSWORD;
const judgeUserName: string = config.get('testAccounts.testJudgeUserName');
const judgePassword: string = process.env.TEST_JUDGE_X_PASSWORD;
const homeOfficeUserName: string = config.get('testAccounts.testHomeOfficeGenericUserName');
const homeOfficePassword: string = process.env.TEST_HOMEOFFICE_GENERIC_PASSWORD;
const legalRepUserName: string = config.get('testAccounts.testLawFirmAUsername');
const legalRepPassword: string = process.env.TEST_LAW_FIRM_SHARE_CASE_A_PASSWORD;

async function triggerEvent(user: UserInfo, object: string, userRunningEvent: string, appealType?: string, isLegalRep: boolean = false) {
  const json = JSON.parse(object);
  const event = json.event;
  const caseData = json.case_data || {};
  if (['submitAppeal', 'editAppeal'].includes(event.id)) {
    caseData.appellantGivenNames = user.forename;
    caseData.appellantFamilyName = user.surname;
    caseData[isLegalRep ? 'email' : 'appellantEmailAddress'] = user.email;
    caseData.appealType = appealType ? appealType : 'protection';
  }
  let headers;
  let citizen: boolean = true;
  let userId: string = user.userId;
  switch (userRunningEvent) {
    case 'caseOfficer':
      headers = await getSecurityHeaders({ email: caseOfficerUserName, password: caseOfficerPassword });
      userId = await getUserId(headers.userToken);
      citizen = false;
      break;
    case 'homeOffice':
      headers = await getSecurityHeaders({ email: homeOfficeUserName, password: homeOfficePassword });
      userId = await getUserId(headers.userToken);
      citizen = false;
      break;
    case 'adminOfficer':
      headers = await getSecurityHeaders({ email: adminOfficerUserName, password: adminOfficerPassword });
      userId = await getUserId(headers.userToken);
      citizen = false;
      break;
    case 'judge':
      headers = await getSecurityHeaders({ email: judgeUserName, password: judgePassword });
      userId = await getUserId(headers.userToken);
      citizen = false;
      break;
    case 'legalRep':
      headers = await getSecurityHeaders({ email: legalRepUserName, password: legalRepPassword });
      userId = await getUserId(headers.userToken);
      citizen = false;
      break;
    default:
      headers = await getSecurityHeaders(user);
      break;
  }
  await updateAppeal(event, userId, user.caseId, caseData, headers, citizen);
}

async function createAndSubmitLegalRepCase() {
  const user: UserInfo = getCitizenUserFromThread();
  await createLegalRepCase(user);
  await triggerEvent(user, JSON.stringify(events.submitAppealLegalRep), 'legalRep', 'deprivation', true);
}

async function stopRepresentingClient() {
  const user: UserInfo = getCitizenUserFromThread();
  await triggerEvent(user, JSON.stringify(events.stopRepresentingClient), 'legalRep');
}

async function createCaseInState(user: UserInfo, state: State, appealType: string = 'protection', decisionType: string = 'granted') {
  await triggerEvent(user, JSON.stringify(events.editAppeal), 'aip', appealType);
  if (state === State.appealStarted) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.submitAppeal), 'aip', appealType);
  if ([State.pendingPayment, State.appealSubmitted].includes(state)) {
    return;
  }
  if (state === State.ended) {
    await triggerEvent(user, JSON.stringify(events.endAppeal), 'caseOfficer', appealType);
    return;
  }
  if (['protection', 'revocationOfProtection'].includes(appealType)) {
    await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  }
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  if (state === State.awaitingRespondentEvidence) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  if (state === State.awaitingReasonsForAppeal) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  if (state === State.reasonsForAppealSubmitted) {
    return;
  }
  if (state === State.awaitingClarifyingQuestionsAnswers) {
    await triggerEvent(user, JSON.stringify(events.sendClarifyingQuestions), 'caseOfficer');
    return;
  }
  await triggerEvent(user, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  if (state === State.respondentReview) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  if (state === State.submitHearingRequirements) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.draftHearingRequirements), 'aip');
  if (state === State.listing) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.listCase), 'adminOfficer');
  if (state === State.prepareForHearing) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  if (state === State.finalBundling) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(user, State.preHearing);
  if (state === State.preHearing) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.startDecisionAndReasons), 'caseOfficer');
  if (state === State.decision) {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.prepareDecisionAndReasons), 'judge');
  if (decisionType === 'granted') {
    await triggerEvent(user, JSON.stringify(events.completeDecisionAndReasonsGranted), 'judge');
  } else {
    await triggerEvent(user, JSON.stringify(events.completeDecisionAndReasonsDismissed), 'judge');
  }
  if (state === State.decided) {
    return;
  }
}

async function createCaseInStateFromThread(state: State, appealType: string = 'protection', decisionType: string = 'granted') {
  const user: UserInfo = getCitizenUserFromThread();
  await createCaseInState(user, state, appealType, decisionType);
}

async function waitForStateChange(user: UserInfo, expectedState: State): Promise<void> {
  const maxAttempts = 12;
  const delay = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const currentState = await getAppealState(user.userId, user.caseId, await getSecurityHeaders(user));
    if (currentState === expectedState.valueOf()) {
      return;
    }
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait for 5 seconds
    }
  }

  throw new Error(`State did not change to '${expectedState}' within ${maxAttempts * delay / 1000} seconds.`);
}

export {
  createCaseInState,
  createCaseInStateFromThread,
  createAndSubmitLegalRepCase,
  stopRepresentingClient,
  State
};
