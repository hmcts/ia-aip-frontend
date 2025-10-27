import axios from 'axios';
import config from 'config';
import rp from 'request-promise';
import { SecurityHeaders } from '../../app/service/authentication-service';
import { isJWTExpired } from '../../app/utils/jwt-utils';
import Logger, { getLogLabel } from '../../app/utils/logger';
import { getCitizenUserFromThread, getUserId, getUserToken, UserInfo } from './user-service';

const s2sSecret: string = config.get('s2s.secret');
const s2sUrl: string = config.get('s2s.url');
const microServiceName: string = config.get('s2s.microserviceName');
const otp = require('otp');

const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');
const legalRepUserName: string = config.get('testAccounts.testLawFirmAUsername');
const legalRepPassword: string = process.env.TEST_LAW_FIRM_SHARE_CASE_A_PASSWORD;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const events = require('./case-events/index.js');

let serviceToken = null;

function generateSupplementaryId(): Record<string, Record<string, string>> {
  let serviceId: Record<string, string> = {};
  serviceId['HMCTSServiceId'] = 'BFA1';
  let request: Record<string, Record<string, string>> = {};
  request['$set'] = serviceId;
  return request;
}

function createOptions(userId: string, headers: SecurityHeaders, uri) {
  return {
    uri: uri,
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'content-type': 'application/json',
      UserId: userId // Hack param to prove RIA-5761.
    },
    json: true
  };
}

function startCreateCase(userId: string, headers: SecurityHeaders, isLegalRep: boolean = false): Promise<StartEventResponse> {
  return rp.get(createOptions(
    userId,
    headers,
    `${ccdBaseUrl}/${isLegalRep ? 'caseworkers' : 'citizens'}/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/event-triggers/startAppeal/token`
  ));
}

function submitCreateCase(userId: string, headers: SecurityHeaders, startEvent: SubmitEventData, isLegalRep: boolean = false): Promise<CcdCaseDetails> {
  const options: any = createOptions(
    userId,
    headers,
    `${ccdBaseUrl}/${isLegalRep ? 'caseworkers' : 'citizens'}/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases?ignore-warning=true`);
  options.body = startEvent;

  return rp.post(options);
}

function startUpdateAppeal(userId: string, caseId: string, eventId: string, headers: SecurityHeaders, citizen: boolean): Promise<StartEventResponse> {
  return rp.get(createOptions(
    userId,
    headers,
    `${ccdBaseUrl}/${citizen ? 'citizens' : 'caseworkers'}/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/event-triggers/${eventId}/token`
  ));
}

function submitUpdateAppeal(userId: string, caseId: string, headers: SecurityHeaders, event: SubmitEventData, citizen: boolean): Promise<CcdCaseDetails> {
  const options: any = createOptions(
    userId,
    headers,
    `${ccdBaseUrl}/${citizen ? 'citizens' : 'caseworkers'}/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/events`);
  options.body = event;

  return rp.post(options);
}

async function getAppealState(userId: string, caseId: string, headers: SecurityHeaders): Promise<string> {
  const options: any = createOptions(
    userId,
    headers,
    `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}`);

  const response = await rp.get(options);
  return response.state;
}

async function requestServiceToken() {
  const uri = `${s2sUrl}/lease`;
  const oneTimePassword = await otp(s2sSecret).totp();
  const request = {
    uri: uri,
    body: {
      microservice: microServiceName,
      oneTimePassword: oneTimePassword
    }
  };
  let res;
  try {
    res = await axios.post(request.uri, request.body);
  } catch (err) {
    logger.exception(err, logLabel);
  }
  if (res && res.data) {
    serviceToken = res.data;
    logger.trace('Received S2S token and stored token', logLabel);
  } else {
    logger.exception('Could not retrieve S2S token', logLabel);
  }
  return serviceToken;
}

async function getServiceToken() {
  if (serviceToken == null || isJWTExpired(serviceToken)) {
    logger.trace('Token expired Attempting to acquire a new one.', logLabel);
    await requestServiceToken();
  }
  return `Bearer ${serviceToken}`;
}

async function getSecurityHeaders(user: UserInfo): Promise<SecurityHeaders> {
  const userToken: string = await getUserToken(user);
  const serviceToken: string = await getServiceToken();
  return { userToken, serviceToken };
}

async function createCase(user: UserInfo): Promise<void> {
  const headers = await getSecurityHeaders(user);
  const startEventResponse = await startCreateCase(user.userId, headers);
  const supplementaryDataRequest = generateSupplementaryId();

  const caseDetails: CcdCaseDetails = await submitCreateCase(user.userId, headers, {
    event: {
      id: startEventResponse.event_id,
      summary: 'Create case AIP',
      description: 'Create case AIP'
    },
    data: {
      journeyType: 'aip'
    },
    event_token: startEventResponse.token,
    ignore_warning: true,
    supplementary_data_request: supplementaryDataRequest
  });
  user.caseId = caseDetails.id;
  logger.trace(`Created case for user '${user.userId}' with case id '${user.caseId}'`, logLabel);
}

async function createLegalRepCase(user: UserInfo): Promise<void> {
  const headers = await getSecurityHeaders({ email: legalRepUserName, password: legalRepPassword });
  const userId = await getUserId(headers.userToken);
  const startEventResponse = await startCreateCase(userId, headers, true);
  const supplementaryDataRequest = generateSupplementaryId();
  const data = events.startAppealLegalRep.case_data;
  const caseDetails: CcdCaseDetails = await submitCreateCase(userId, headers, {
    event: {
      id: startEventResponse.event_id,
      summary: 'Create case LR',
      description: 'Create case LR'
    },
    data: data,
    event_token: startEventResponse.token,
    ignore_warning: true,
    supplementary_data_request: supplementaryDataRequest
  }, true);
  user.caseId = caseDetails.id;
  logger.trace(`Created case for user '${userId}' with case id '${user.caseId}'`, logLabel);
}

async function createCaseFromThread() {
  await createCase(getCitizenUserFromThread());
}

async function updateAppeal(event, userId: string, caseId: string, caseData: CaseData, headers: SecurityHeaders, citizen: boolean): Promise<void> {
  logger.trace(`Received call to update appeal with event '${event.id}', user '${userId}', updatedCase.id '${caseId}'`, logLabel);
  const updateEventResponse = await startUpdateAppeal(userId, caseId, event.id, headers, citizen);
  logger.trace(`Submitting update appeal case with event '${event.id}'`, logLabel);
  const supplementaryDataRequest = generateSupplementaryId();

  await submitUpdateAppeal(userId, caseId, headers, {
    event: {
      id: updateEventResponse.event_id,
      summary: event.summary,
      description: event.summary
    },
    data: caseData,
    event_token: updateEventResponse.token,
    ignore_warning: true,
    supplementary_data_request: supplementaryDataRequest
  }, citizen);
  logger.trace(`Successfully submitted update appeal case with event '${event.id}'`, logLabel);
}

export {
  getServiceToken,
  updateAppeal,
  getSecurityHeaders,
  getAppealState,
  createCase,
  createCaseFromThread,
  createLegalRepCase
};
