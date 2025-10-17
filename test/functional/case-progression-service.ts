import axios from 'axios';
import config from 'config';
import rp from 'request-promise';
import { SecurityHeaders } from '../../app/service/authentication-service';
import S2SService from '../../app/service/s2s-service';
import { isJWTExpired } from '../../app/utils/jwt-utils';
import Logger, { getLogLabel } from '../../app/utils/logger';
import { getSecurityHeaders, updateAppeal } from './ccd-service';
import { AipUser, awaitingCmaRequirementsUser, functionalUsers, getUserToken } from './user-service';

import editAppealData from './case-events/edit-appeal-in-started.json';
import appealSubmittedData from './case-events/submit-appeal.json';
const s2sSecret: string = config.get('s2s.secret');
const s2sUrl: string = config.get('s2s.url');
const microServiceName: string = config.get('s2s.microserviceName');
const otp = require('otp');

const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

let serviceToken = null;

async function triggerEvent(user: AipUser, object: string) {
  const json = JSON.parse(object);
  const event = json.event;
  const newCaseData = json.case_data;
  const caseData = {
    ...user.caseData,
    ...newCaseData
  };
  delete caseData['TTL'];
  const headers = await getSecurityHeaders(user);
  const updatedCcdCase: CcdCaseDetails = {
    id: user.caseId,
    state: json.state,
    case_data: caseData
  };
  await updateAppeal(event, user.userId, updatedCcdCase, headers);
  user.caseData = caseData;
}

async function prepareTestCases() {
  await triggerEvent(awaitingCmaRequirementsUser, JSON.stringify(editAppealData));
  await triggerEvent(awaitingCmaRequirementsUser, JSON.stringify(appealSubmittedData));
}

export {
  prepareTestCases
};
