import config from 'config';
import rp from 'request-promise';
import { SecurityHeaders } from './getHeaders';

const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');

export default class CcdService {
  createCase(userId: String, headers: SecurityHeaders) {
    const options = {
      // eslint-disable-next-line max-len
      uri: `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/event-triggers/startAppeal/token`,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'content-type': 'application/json'
      },
      json: true
    };

    return rp.get(options);
  }

  loadCase(userId: String, headers: SecurityHeaders) {
    const options = {
      // eslint-disable-next-line max-len
      uri: `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases`,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'content-type': 'application/json'
      },
      json: true
    };

    return rp.get(options);
  }

  loadOrCreateCase(userId: String, headers: SecurityHeaders) {
    return this.loadCase(userId, headers).then(response => {
      if (response.length > 0) {
        return response[0];
      } else {
        return this.createCase(userId, headers).then(response => {
          return response;
        });
      }
    });
  }
}
