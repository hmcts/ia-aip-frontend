import config from 'config';
import rp from 'request-promise';
import Logger, { getLogLabel } from '../utils/logger';
import { SecurityHeaders } from './getHeaders';

const ccdBaseUrl = config.get('ccd.apiUrl');
const jurisdictionId = config.get('ccd.jurisdictionId');
const caseType = config.get('ccd.caseType');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

interface CcdCaseDetails {
  id: string;
  case_data: CaseData;
}

interface CaseData {
  appellantTitle?: string;
  appellantGivenNames?: string;
  appellantFamilyName?: string;
  appellantDateOfBirth?: string;
  homeOfficeReferenceNumber?: string;
  homeOfficeDecisionDate?: string;
  journeyType: string;
}

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
  data: CaseData;
  event_token: string;
  ignore_warning: boolean;
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

  startUpdateCase(userId: string, caseId: string, headers: SecurityHeaders): Promise<StartEventResponse> {
    return rp.get(this.createOptions(
      userId,
      headers,
      `${ccdBaseUrl}/citizens/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/event-triggers/editAppeal/token`
    ));
  }

  submitUpdateCase(userId: string, caseId: string, headers: SecurityHeaders, event: SubmitEventData): Promise<CcdCaseDetails> {
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

  async updateCase(userId: string, updatedCase: CcdCaseDetails, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    const updateEventResponse = await this.startUpdateCase(userId, updatedCase.id, headers);

    const updatesCase = await this.submitUpdateCase(userId, updatedCase.id, headers, {
      event: {
        id: updateEventResponse.event_id,
        summary: 'Update case AIP',
        description: 'Update case AIP'
      },
      data: updatedCase.case_data,
      event_token: updateEventResponse.token,
      ignore_warning: true
    });

    return updatesCase;
  }

  async loadOrCreateCase(userId: string, headers: SecurityHeaders): Promise<CcdCaseDetails> {
    logger.trace('Loading or creating case', logLabel);
    const cases = await this.loadCasesForUser(userId, headers);
    if (cases.length > 0) {
      logger.trace(`found [${cases.length}] cases`, logLabel);
      return cases[0];
    } else {
      logger.trace('Did not find a case', logLabel);
      return this.createCase(userId, headers);
    }
  }
}

export {
  CcdService,
  CcdCaseDetails
};
