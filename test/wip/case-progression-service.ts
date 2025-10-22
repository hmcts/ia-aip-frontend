import config from 'config';

const events = require('./case-events/index.js');
import { getAppealState, getSecurityHeaders, updateAppeal } from './ccd-service';
import {
  getUserId,
  UserInfo
} from './user-service';

const caseOfficerUserName: string = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword: string = process.env.TEST_CASEOFFICER_PASSWORD;
const adminOfficerUserName: string = config.get('testAccounts.testAdminOfficerUserName');
const adminOfficerPassword: string = process.env.TEST_ADMINOFFICER_PASSWORD;
const judgeUserName: string = config.get('testAccounts.testJudgeUserName');
const judgePassword: string = process.env.TEST_JUDGE_X_PASSWORD;
const homeOfficeUserName: string = config.get('testAccounts.testHomeOfficeGenericUserName');
const homeOfficePassword: string = process.env.TEST_HOMEOFFICE_GENERIC_PASSWORD;

async function triggerEvent(user: UserInfo, object: string, userRunningEvent: string) {
  const json = JSON.parse(object);
  const event = json.event;
  let caseData = json.case_data || {};
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
    default:
      headers = await getSecurityHeaders(user);
      break;
  }
  await updateAppeal(event, userId, user.caseId, caseData, headers, citizen);
}

type State = 'appealStarted' | 'appealSubmitted' | 'pendingPayment' | 'awaitingRespondentEvidence' | 'awaitingReasonsForAppeal' | 'reasonsForAppealSubmitted' | 'awaitingClarifyingQuestionsAnswers' | 'respondentReview' | 'submitHearingRequirements' | 'listing' | 'prepareForHearing' | 'finalBundling' | 'preHearing' | 'decision' | 'decided';

async function createCaseInState(user: UserInfo, state: State, appealType: string = 'protection', decisionType: string = 'granted') {
  await triggerEvent(user, JSON.stringify({
    ...events.editAppeal.case_data,
    'appellantGivenNames': user.forename,
    'appellantFamilyName': user.surname,
    'appellantEmailAddress': user.email,
    'appealType': appealType
  }), 'aip');
  if (state === 'appealStarted') {
    return;
  }
  await triggerEvent(user, JSON.stringify({
    ...events.submitAppeal.case_data,
    'appellantGivenNames': user.forename,
    'appellantFamilyName': user.surname,
    'appellantEmailAddress': user.email,
    'appealType': appealType
  }), 'aip');
  if (['appealSubmitted', 'pendingPayment'].includes(state)) {
    return;
  }
  if (['protection', 'revocationOfProtection'].includes(appealType)) {
    await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  }
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  if (state === 'awaitingRespondentEvidence') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  if (state === 'awaitingReasonsForAppeal') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  if (state === 'reasonsForAppealSubmitted') {
    return;
  }
  if (state === 'awaitingClarifyingQuestionsAnswers') {
    await triggerEvent(user, JSON.stringify(events.sendClarifyingQuestions), 'caseOfficer');
    return;
  }
  await triggerEvent(user, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  if (state === 'respondentReview') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  if (state === 'submitHearingRequirements') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.draftHearingRequirements), 'aip');
  if (state === 'listing') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.listCase), 'adminOfficer');
  if (state === 'prepareForHearing') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  if (state === 'finalBundling') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(user, 'preHearing');
  if (state === 'preHearing') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.startDecisionAndReasons), 'caseOfficer');
  if (state === 'decision') {
    return;
  }
  await triggerEvent(user, JSON.stringify(events.prepareDecisionAndReasons), 'judge');
  if (decisionType === 'granted') {
    await triggerEvent(user, JSON.stringify(events.completeDecisionAndReasonsGranted), 'judge');
  } else {
    await triggerEvent(user, JSON.stringify(events.completeDecisionAndReasonsDismissed), 'judge');
  }
  if (state === 'decided') {
    return;
  }
}

async function waitForStateChange(user: UserInfo, expectedState: State): Promise<void> {
  const maxAttempts = 12;
  const delay = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const currentState = await getAppealState(user.userId, user.caseId, await getSecurityHeaders(user));
    if (currentState === expectedState) {
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
  State
};
