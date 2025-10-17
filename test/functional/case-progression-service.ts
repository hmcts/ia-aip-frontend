import axios from 'axios';
import config from 'config';
import rp from 'request-promise';
import { SecurityHeaders } from '../../app/service/authentication-service';
import S2SService from '../../app/service/s2s-service';
import { isJWTExpired } from '../../app/utils/jwt-utils';
import Logger, { getLogLabel } from '../../app/utils/logger';
import events from './case-events/index.js';
import { getSecurityHeaders, updateAppeal } from './ccd-service';
import { awaitingCmaRequirementsUser, functionalUsers, getUserId, getUserToken, UserInfo } from './user-service';
const s2sSecret: string = config.get('s2s.secret');
const s2sUrl: string = config.get('s2s.url');
const microServiceName: string = config.get('s2s.microserviceName');
const otp = require('otp');
const caseOfficerUserName: string = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword: string = process.env.TEST_CASEOFFICER_PASSWORD;
const adminOfficerUserName: string = config.get('testAccounts.testAdminOfficerUserName');
const adminOfficerPassword: string = process.env.TEST_ADMINOFFICER_PASSWORD;
const judgeUserName: string = config.get('testAccounts.testJudgeUserName');
const judgePassword: string = process.env.TEST_JUDGE_X_PASSWORD;
const homeOfficeUserName: string = config.get('testAccounts.testHomeOfficeGenericUserName');
const homeOfficePassword: string = process.env.TEST_HOMEOFFICE_GENERIC_PASSWORD;
const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

let serviceToken = null;

async function triggerEvent(user: UserInfo, object: string, userRunningEvent: string) {
  const json = JSON.parse(object);
  const event = json.event;
  const newCaseData = json.case_data;
  const caseData = {
    ...user.caseData,
    ...newCaseData
  };
  delete caseData['TTL'];
  let headers;
  let citizen: boolean = true;
  let userId: string = user.userId;
  switch (userRunningEvent) {
    case 'caseOfficer':
      headers = await getSecurityHeaders({ email: caseOfficerUserName, password: caseOfficerPassword });
      userId = await getUserId(headers.userToken);
      citizen = false;
      delete caseData['appealReferenceNumber'];
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
  user.caseData = caseData;
}

async function prepareTestCases() {
  await triggerEvent(awaitingCmaRequirementsUser, JSON.stringify(events.editAppealData), 'aip');
  await triggerEvent(awaitingCmaRequirementsUser, JSON.stringify(events.appealSubmittedData), 'aip');
  await triggerEvent(awaitingCmaRequirementsUser, JSON.stringify(events.requestHoData), 'caseOfficer');
}

export {
  prepareTestCases
};
