import config from 'config';

const events = require('./case-events/index.js');
import { getAppealState, getSecurityHeaders, updateAppeal } from './ccd-service';
import {
  appealSubmittedUser,
  getUserId, hasCaseUser,
  preHearingUser,
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
  if (['editAppeal', 'submitAppeal'].includes(event.id)) {
    caseData = {
      ...caseData,
      'appellantGivenNames': user.forename,
      'appellantFamilyName': user.surname,
      'appellantEmailAddress': user.email
    };
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
    default:
      headers = await getSecurityHeaders(user);
      break;
  }
  await updateAppeal(event, userId, user.caseId, caseData, headers, citizen);
}

async function prepareHasCaseUser() {
  await triggerEvent(hasCaseUser, JSON.stringify(events.editAppeal), 'aip');
}

async function prepareAppealSubmittedUser() {
  await triggerEvent(appealSubmittedUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(appealSubmittedUser, JSON.stringify(events.submitAppeal), 'aip');
}

async function prepareAwaitingReasonsForAppealUser() {
  await triggerEvent(preHearingUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
}

async function preparePartialAwaitingReasonsForAppealUser() {
  await triggerEvent(preHearingUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
}

async function prepareClarifyingQuestionsUser() {
  await triggerEvent(preHearingUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.sendClarifyingQuestions), 'caseOfficer');

}

async function prepareDecidedUser() {
  await triggerEvent(preHearingUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.draftHearingRequirements), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.listCase), 'adminOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(preHearingUser, 'preHearing');
  await triggerEvent(preHearingUser, JSON.stringify(events.startDecisionAndReasons), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.prepareDecisionAndReasons), 'judge');
  await triggerEvent(preHearingUser, JSON.stringify(events.completeDecisionAndReasonsGranted), 'judge');
}

async function prepareFtpaOutOfTimeApplicationStartedUser() {
  await triggerEvent(preHearingUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.draftHearingRequirements), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.listCase), 'adminOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(preHearingUser, 'preHearing');
  await triggerEvent(preHearingUser, JSON.stringify(events.startDecisionAndReasons), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.prepareDecisionAndReasons), 'judge');
  await triggerEvent(preHearingUser, JSON.stringify(events.completeDecisionAndReasonsDismissed), 'judge');
}

async function preparePreHearingUser() {
  await triggerEvent(preHearingUser, JSON.stringify(events.editAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHoData), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentEvidence), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHoBundle), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestReasonsForAppeal), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.submitReasonsForAppeal), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestRespondentReview), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.uploadHomeOfficeAppealResponse), 'homeOffice');
  await triggerEvent(preHearingUser, JSON.stringify(events.reviewHoResponse), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.requestHearingRequirements), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.draftHearingRequirements), 'aip');
  await triggerEvent(preHearingUser, JSON.stringify(events.reviewHearingRequirements), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.listCase), 'adminOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.createCaseSummary), 'caseOfficer');
  await triggerEvent(preHearingUser, JSON.stringify(events.generateHearingBundle), 'caseOfficer');
  await waitForStateChange(preHearingUser, 'preHearing');
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
  prepareFtpaOutOfTimeApplicationStartedUser
};
