import axios from 'axios';
import config from 'config';
import Logger, { getLogLabel } from '../utils/logger';
import { asBooleanValue } from '../utils/utils';
import { SecurityHeaders } from './authentication-service';

const ccdBaseUrl: string = config.get('ccd.apiUrl');
const jurisdictionId: string = config.get('ccd.jurisdictionId');
const caseType: string = config.get('ccd.caseType');
const timelineEnabled = asBooleanValue(config.get('features.timelineEnabled'));

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function extractHistoryDetails(historyEvents: any[]): HistoryEvent[] {
  return historyEvents
    .filter(event => event.id !== 'editAppeal')
    .filter(event => event.id !== 'editAipHearingRequirements')
    .map(event => ({
      id: event.id,
      event: {
        eventName: event.event_name,
        description: event.description
      },
      user: {
        id: event.user_id,
        lastName: event.user_last_name,
        firstName: event.user_first_name
      },
      createdDate: event.created_date,
      caseTypeVersion: event.case_type_version,
      state: {
        id: event.state_id,
        name: event.state_name
      },
      data: event.data
    }));
}

function generateSupplementaryId(): Record<string, Record<string, string>> {
  let serviceId: Record<string, string> = {};
  serviceId['HMCTSServiceId'] = 'BFA1';
  let request: Record<string, Record<string, string>> = {};
  request['$set'] = serviceId;
  return request;
}

class CcdService {
  private createOptions(userId: string, headers: SecurityHeaders) {
    return {
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'content-type': 'application/json',
        UserId: userId // Hack param to prove RIA-5761.
      }
    };
  }

  async startCreateCase(userId: string, headers: SecurityHeaders): Promise<StartEventResponse> {
    const url = `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/event-triggers/startAppeal/token`;
    const options = this.createOptions(
      userId,
      headers
    );
    const response = await axios.get(url, options);
    return response.data;
  }

  async submitCreateCase(userId: string, headers: SecurityHeaders, startEvent: SubmitEventData): Promise<CcdCaseDetails> {
    const url = `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases?ignore-warning=true`;
    const options: any = this.createOptions(
      userId,
      headers
    );

    const response = await axios.post(url, startEvent, options);
    return response.data;
  }

  async startUpdateAppeal(userId: string, caseId: string, eventId: string, headers: SecurityHeaders): Promise<StartEventResponse> {
    const url = `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/event-triggers/${eventId}/token`;
    logger.trace(`CCD startUpdateAppeal URL: ${url}`, logLabel);
    const options = this.createOptions(
      userId,
      headers
    );
    const response = await axios.get(url, options);
    return response.data;
  }

  async submitUpdateAppeal(userId: string, caseId: string, headers: SecurityHeaders, event: SubmitEventData): Promise<CcdCaseDetails> {
    const url = `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/events`;
    logger.trace(`CCD submitUpdateAppeal URL: ${url}`, logLabel);
    const options: any = this.createOptions(
      userId,
      headers
    );

    const response = await axios.post(url, event, options);
    return response.data;
  }

  async loadCasesForUser(userId: string, headers: SecurityHeaders): Promise<ES<CcdCaseDetails>> {
    const query = {
      query: { match_all: {} },
      sort: [{ id: { order: 'asc' } }]
    };
    const url = `${ccdBaseUrl}/searchCases?ctid=${caseType}`;
    const options: any = this.createOptions(
      userId,
      headers
    );

    const response = await axios.post(url, query, options);
    return response.data;
  }

  async retrieveCaseHistoryV2(userId: string, caseId: string, headers: SecurityHeaders): Promise<any> {
    const url = `${ccdBaseUrl}/cases/${caseId}/events`;
    const options = this.createOptions(
      userId,
      headers
    );
    // The following extra headers are needed to use the v2 endpoint
    options.headers['accept'] = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.case-events.v2+json;charset=UTF-8';
    options.headers['experimental'] = 'true';

    const response = await axios.get(url, options);
    return response.data;
  }

  async createCase(userId: string, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    const startEventResponse = await this.startCreateCase(userId, headers);
    const supplementaryDataRequest = generateSupplementaryId();

    return this.submitCreateCase(userId, headers, {
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
  }

  async updateAppeal(event, userId: string, updatedCase: CcdCaseDetails, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    logger.trace(`Received call to update appeal with event '${event.id}', user '${userId}', updatedCase.id '${updatedCase.id}' `, logLabel);
    const updateEventResponse = await this.startUpdateAppeal(userId, updatedCase.id, event.id, headers);
    logger.trace(`Submitting update appeal case with event '${event.id}'`, logLabel);
    const supplementaryDataRequest = generateSupplementaryId();
    logger.trace('updateEventResponse.event_id: ' + updateEventResponse.event_id, logLabel);
    return this.submitUpdateAppeal(userId, updatedCase.id, headers, {
      event: {
        id: updateEventResponse.event_id,
        summary: event.summary,
        description: event.summary
      },
      data: updatedCase.case_data,
      event_token: updateEventResponse.token,
      ignore_warning: true,
      supplementary_data_request: supplementaryDataRequest
    });
  }

  async loadOrCreateCase(userId: string, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    logger.trace('Loading or creating case', logLabel);
    let data: ES<CcdCaseDetails> = await this.loadCasesForUser(userId, headers);
    if (data.total > 0) {
      return data.cases[0];
    } else {
      logger.trace('Did not find a case', logLabel);
      const newCase: CcdCaseDetails = await this.createCase(userId, headers);
      return newCase;
    }
  }

  async getCaseHistory(userId: string, caseId: string, headers: SecurityHeaders): Promise<HistoryEvent[]> {
    logger.trace(`Loading history for case with ID ${caseId}`, logLabel);
    let history = [];
    if (timelineEnabled) {
      const historyResponse = await this.retrieveCaseHistoryV2(userId, caseId, headers);
      const events = historyResponse.auditEvents || [];
      history = extractHistoryDetails(events);
    }
    return history;
  }
}

interface ES<T> {
  length: number;
  cases: T[];
  total: number;
}

export {
  CcdService
};
