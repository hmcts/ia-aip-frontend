import config from 'config';
import rp from 'request-promise';
import Logger, { getLogLabel } from '../utils/logger';
import { SecurityHeaders } from './authentication-service';

const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');
const timelineEnabled = config.get('features.timelineEnabled');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export const Events = {
  EDIT_APPEAL: { id: 'editAppeal', summary: 'Update appeal case AIP', description: 'Update appeal case AIP' },
  SUBMIT_APPEAL: { id: 'submitAppeal', summary: 'Submit appeal case AIP', description: 'Submit Appeal case AIP' },
  EDIT_REASONS_FOR_APPEAL: {
    id: 'editReasonsForAppeal',
    summary: 'Edit reasons for appeal case AIP',
    description: 'Edit reasons for appeal case AIP'
  },
  SUBMIT_REASONS_FOR_APPEAL: {
    id: 'submitReasonsForAppeal',
    summary: 'Submits Reasons for appeal case AIP',
    description: 'Submits Reasons for appeal case AIP'
  }
};

interface StartEventResponse {
  event_id: string;
  token: string;
}

interface Event {
  id: string;
  summary: string;
  description: string;
}

interface SubmitEventData {
  event: Event;
  data: Partial<CaseData>;
  event_token: string;
  ignore_warning: boolean;
}

function extractHistoryDetails(historyEvents: any[]): EventHistory[] {
  return historyEvents.map(event => ({
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

class CcdService {
  private createOptions(userId: string, headers: SecurityHeaders, uri) {
    return {
      uri: uri,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'content-type': 'application/json'
      },
      json: true
    };
  }

  startCreateCase(userId: string, headers: SecurityHeaders): Promise<StartEventResponse> {
    return rp.get(this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/event-triggers/startAppeal/token`
    ));
  }

  submitCreateCase(userId: string, headers: SecurityHeaders, startEvent: SubmitEventData): Promise<CcdCaseDetails> {
    const options: any = this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases?ignore-warning=true`);
    options.body = startEvent;

    return rp.post(options);
  }

  startUpdateAppeal(userId: string, caseId: string, eventId: string, headers: SecurityHeaders): Promise<StartEventResponse> {
    return rp.get(this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/event-triggers/${eventId}/token`
    ));
  }

  submitUpdateAppeal(userId: string, caseId: string, headers: SecurityHeaders, event: SubmitEventData): Promise<CcdCaseDetails> {
    const options: any = this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/events`);
    options.body = event;

    return rp.post(options);
  }

  loadCasesForUser(userId: string, headers: SecurityHeaders): Promise<CcdCaseDetails[]> {
    return rp.get(this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases`)
    );
  }

  retrieveCaseHistoryV2(userId: string, caseId: string, headers: SecurityHeaders): Promise<any> {
    const obj = this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/cases/${caseId}/events`);
    // The following extra headers are needed to use the v2 endpoint
    obj.headers['accept'] = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.case-events.v2+json;charset=UTF-8';
    obj.headers['experimental'] = 'true';

    return rp.get(obj);
  }

  async createCase(userId: string, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    const startEventResponse = await this.startCreateCase(userId, headers);

    const createdCase = await this.submitCreateCase(userId, headers, {
      event: {
        id: startEventResponse.event_id,
        summary: 'Create case AIP',
        description: 'Create case AIP'
      },
      data: {
        journeyType: 'aip'
      },
      event_token: startEventResponse.token,
      ignore_warning: true
    });
    return createdCase;
  }

  async updateAppeal(event, userId: string, updatedCase: CcdCaseDetails, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    logger.trace(`Received call to update appeal with event '${event.id}', user '${userId}', updatedCase.id '${updatedCase.id}' `, logLabel);
    const updateEventResponse = await this.startUpdateAppeal(userId, updatedCase.id, event.id, headers);
    logger.trace(`Submitting update appeal case with event '${event.id}'`, logLabel);

    return this.submitUpdateAppeal(userId, updatedCase.id, headers, {
      event: {
        id: updateEventResponse.event_id,
        summary: event.summary,
        description: event.summary
      },
      data: updatedCase.case_data,
      event_token: updateEventResponse.token,
      ignore_warning: true
    });
  }

  async loadOrCreateCase(userId: string, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    logger.trace('Loading or creating case', logLabel);
    const cases: CcdCaseDetails[] = await this.loadCasesForUser(userId, headers);
    if (cases.length > 0) {
      logger.trace(`found [${cases.length}] cases`, logLabel);
      return cases[0];
    } else {
      logger.trace('Did not find a case', logLabel);
      const newCase: CcdCaseDetails = await this.createCase(userId, headers);
      return newCase;
    }
  }

  async getCaseHistory(userId: string, caseId: string, headers: SecurityHeaders): Promise<EventHistory[]> {
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

export {
  CcdService
};
