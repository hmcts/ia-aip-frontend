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

async function prepareHasCaseUser(user: UserInfo) {
  await triggerEvent(user, JSON.stringify(events.editAppeal), 'aip');
}

async function submitAppeal(user: UserInfo, appealType: string = 'protection') {
  await triggerEvent(user, JSON.stringify({
    ...events.editAppeal.case_data,
    'appellantGivenNames': user.forename,
    'appellantFamilyName': user.surname,
    'appellantEmailAddress': user.email,
    'appealType': appealType
  }), 'aip');
  await triggerEvent(user, JSON.stringify({
    ...events.submitAppeal.case_data,
    'appellantGivenNames': user.forename,
    'appellantFamilyName': user.surname,
    'appellantEmailAddress': user.email,
    'appealType': appealType
  }), 'aip');
}

async function prepareAppealSubmittedUser(user: UserInfo) {
  await submitAppeal(user);
}

async function preparePendingPaymentUser(user: UserInfo) {
  await submitAppeal(user, 'refusalOfHumanRights');
}

async function prepareAwaitingReasonsForAppealUser(user: UserInfo) {
  await submitAppeal(user);
  await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
}

async function preparePartialAwaitingReasonsForAppealUser(user: UserInfo) {
  await submitAppeal(user);
  await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
}

async function prepareClarifyingQuestionsUser(user: UserInfo) {
  await submitAppeal(user);
  await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.sendClarifyingQuestions), 'caseOfficer');

}

async function prepareDecidedUser(user: UserInfo) {
  await submitAppeal(user);
  await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  await triggerEvent(user, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.draftHearingRequirements), 'aip');
  await triggerEvent(user, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.listCase), 'adminOfficer');
  await triggerEvent(user, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(user, 'preHearing');
  await triggerEvent(user, JSON.stringify(events.startDecisionAndReasons), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.prepareDecisionAndReasons), 'judge');
  await triggerEvent(user, JSON.stringify(events.completeDecisionAndReasonsGranted), 'judge');
}

async function prepareFtpaOutOfTimeApplicationStartedUser(user: UserInfo) {
  await submitAppeal(user);
  await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  await triggerEvent(user, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.draftHearingRequirements), 'aip');
  await triggerEvent(user, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.listCase), 'adminOfficer');
  await triggerEvent(user, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(user, 'preHearing');
  await triggerEvent(user, JSON.stringify(events.startDecisionAndReasons), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.prepareDecisionAndReasons), 'judge');
  await triggerEvent(user, JSON.stringify(events.completeDecisionAndReasonsDismissed), 'judge');
}

async function preparePreHearingUser(user: UserInfo) {
  await submitAppeal(user);
  await triggerEvent(user, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  await triggerEvent(user, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(user, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.draftHearingRequirements), 'aip');
  await triggerEvent(user, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.listCase), 'adminOfficer');
  await triggerEvent(user, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  await triggerEvent(user, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(user, 'preHearing');
}

async function waitForStateChange(user: UserInfo, expectedState: string) {
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
  prepareHasCaseUser,
  prepareAppealSubmittedUser,
  prepareAwaitingReasonsForAppealUser,
  preparePartialAwaitingReasonsForAppealUser,
  prepareClarifyingQuestionsUser,
  preparePreHearingUser,
  prepareDecidedUser,
  prepareFtpaOutOfTimeApplicationStartedUser,
  preparePendingPaymentUser
};
