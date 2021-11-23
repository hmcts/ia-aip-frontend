import { SecurityHeaders } from '../../../app/service/authentication-service';
import { asBooleanValue } from '../../../app/utils/utils';

const rp = require('request-promise');
const config = require('config');

const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');

const proxyUrl = config.get('proxy.host');
const proxyPort = config.get('proxy.port');

const httpProxyEnabled = asBooleanValue(config.get('httpProxy'));

// tslint:disable:no-console
async function updateAppeal(event, userId: string, caseDetails: CcdCaseDetails, headers: SecurityHeaders) {
  try {
    const caseId = caseDetails.id;

    console.info('======================');
    console.info(`Updating Case Id ${caseId} to ${event.id}`);
    console.info('======================');

    let startUpdateAppealResponse = null;
    const startUpdateAppealOptions = {
      uri: `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/event-triggers/${event.id}/token`,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'content-type': 'application/json'
      },
      json: true
    };

    console.info('->',`Start ${event.id} event`);
    if (httpProxyEnabled) {
      const proxy = `http://${proxyUrl}:${proxyPort}`;
      const proxiedRequest = rp.defaults({ 'proxy': proxy });
      startUpdateAppealResponse = await proxiedRequest.get(startUpdateAppealOptions);
    } else {
      startUpdateAppealResponse = await rp.get(startUpdateAppealOptions);
    }

    let submitUpdateAppealResponse = null;
    const submitUpdateAppealOptions = {
      uri: `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/events`,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'content-type': 'application/json'
      },
      body: {
        event,
        data: caseDetails.case_data,
        event_token: startUpdateAppealResponse.token,
        ignore_warning: true
      },
      json: true
    };

    console.info('->',`Submit ${event.id} event`);
    if (httpProxyEnabled) {
      const proxy = `http://${proxyUrl}:${proxyPort}`;
      const proxiedRequest = rp.defaults({ 'proxy': proxy });
      submitUpdateAppealResponse = await proxiedRequest.post(submitUpdateAppealOptions);
    } else {
      submitUpdateAppealResponse = await rp.post(submitUpdateAppealOptions);
    }
    return submitUpdateAppealResponse;
  } catch (error) {
    console.log('updateAppeal failed with error', error);
  }
}

export {
  updateAppeal
};
