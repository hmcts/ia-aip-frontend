import axios from 'axios';
import config from 'config';
import Logger, { getLogLabel } from '../utils/logger';
import S2SService from './s2s-service';
import { SystemAuthenticationService } from './system-authentication-service';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

const ccdBaseUrl: string = config.get('ccd.apiUrl');
const jurisdictionId: string = config.get('ccd.jurisdictionId');
const caseType: string = config.get('ccd.caseType');

export interface PipValidation {
  accessValidated?: boolean;
  caseIdValid?: boolean;
  doesPinExist?: boolean;
  pinValid?: boolean;
  codeUnused?: boolean;
  codeNotExpired?: boolean;
  caseSummary?: PipCaseSummary;
}

export interface PipCaseSummary {
  name: string,
  referenceNumber: string
  appealReference?: string
}

const PIP_VALIDATION_FAILED: PipValidation = {
  accessValidated: false
};

const CASE_ID_VALIDATION_FAILED: PipValidation = {
  caseIdValid: false
};

const PIP_EXISTS_VALIDATION_FAILED: PipValidation = {
  doesPinExist: false,
  caseIdValid: true
};

const PIP_PIN_VALIDATION_FAILED: PipValidation = {
  pinValid: false,
  caseIdValid: true,
  doesPinExist: true
};

const PIP_USED_VALIDATION_FAILED: PipValidation = {
  codeUnused: false,
  caseIdValid: true,
  doesPinExist: true,
  pinValid: true
};

const PIP_EXPIRY_VALIDATION_FAILED: PipValidation = {
  codeNotExpired: false,
  caseIdValid: true,
  doesPinExist: true,
  pinValid: true,
  codeUnused: true
};


export function validateAccessCode(caseDetails, accessCode: string): boolean {
  if (caseDetails.appellantPinInPost) {
    const expiryDate: Date = new Date(caseDetails.appellantPinInPost.expiryDate);
    if (new Date(Date.now()) <= expiryDate) {
      return caseDetails.appellantPinInPost.pinUsed === 'No'
        && caseDetails.appellantPinInPost.accessCode === accessCode;
    }
  }
  return false;
}

export function validateJoinAppealAccessCodeExpiryDate(joinAppealPin: PinInPost): boolean {
  const expiryDate: Date = new Date(joinAppealPin.expiryDate);
  return new Date(Date.now()) <= expiryDate;
}

export function validateJoinAppealAccessCodeUsed(joinAppealPin: PinInPost): boolean {
  return joinAppealPin.pinUsed === 'No';
}

export function validateJoinAppealAccessCode(joinAppealPin: PinInPost, accessCode: string): boolean {
  return joinAppealPin.accessCode === accessCode;
}

export function validateJoinAppealAccessCodeExists(caseDetails: CaseData): boolean {
  return caseDetails.joinAppealPin !== undefined && caseDetails.joinAppealPin !== null;
}

function validateJoinAppealPin(caseData, accessCode: string, caseId: string): PipValidation {
  if (!validateJoinAppealAccessCodeExists(caseData)) {
    return PIP_EXISTS_VALIDATION_FAILED;
  }
  const joinAppealPin = caseData.joinAppealPin;
  if (!validateJoinAppealAccessCode(joinAppealPin, accessCode)) {
    return PIP_PIN_VALIDATION_FAILED;
  }
  if (!validateJoinAppealAccessCodeUsed(joinAppealPin)) {
    return PIP_USED_VALIDATION_FAILED;
  }
  if (!validateJoinAppealAccessCodeExpiryDate(joinAppealPin)) {
    return PIP_EXPIRY_VALIDATION_FAILED;
  }
  logger.trace(`Join Appeal Pin in Post validation successful for case id - '${caseId}'`, logLabel);
  return getJoinAppealPipValidationSuccess(caseId, caseData);
}

export function getPipValidationSuccess(id: string, caseDetails: CaseData): PipValidation {
  return {
    accessValidated: true,
    caseSummary: {
      name: `${caseDetails.appellantGivenNames} ${caseDetails.appellantFamilyName}`,
      referenceNumber: id
    }
  };
}

export function getJoinAppealPipValidationSuccess(id: string, caseDetails: CaseData): PipValidation {
  return {
    accessValidated: true,
    caseSummary: {
      name: `${caseDetails.appellantGivenNames} ${caseDetails.appellantFamilyName}`,
      appealReference: caseDetails.appealReferenceNumber,
      referenceNumber: id
    }
  };
}

export default class CcdSystemService {
  private readonly _authenticationService: SystemAuthenticationService;
  private readonly _s2sService: S2SService;

  constructor(authenticationService: SystemAuthenticationService, s2sService: S2SService) {
    this._authenticationService = authenticationService;
    this._s2sService = s2sService;
  }

  async pipValidation(caseId: string, accessCode: string): Promise<PipValidation> {
    const userToken = await this._authenticationService.getCaseworkSystemToken();
    const userId = await this._authenticationService.getCaseworkSystemUUID(userToken);
    const headers = await this.getHeaders(userToken);

    return axios.get(
      `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}`, {
        headers: headers
      }
    ).then(function (response) {
      logger.trace(`Pin in Post validation successful for case id - '${caseId}'`, logLabel);
      if (validateAccessCode(response.data.case_data, accessCode)) {
        return getPipValidationSuccess(response.data.id, response.data.case_data);
      }
      return PIP_VALIDATION_FAILED;
    }).catch(function (error) {
      logger.exception(`Appellant Pin in Post validation failed for case id - '${caseId}', Pin entered - '${accessCode}', error - '${error}'`, logLabel);
      return PIP_VALIDATION_FAILED;
    });
  }

  async joinAppealPipValidation(caseId: string, accessCode: string): Promise<PipValidation> {
    return this.getCaseById(caseId)
      .then(function (response) {
      return validateJoinAppealPin(response.data.case_data, accessCode, caseId);
    }).catch(function (error) {
      logger.exception(`Join Appeal case validation failed for case id - '${caseId}'', error - '${error}'`, logLabel);
      return CASE_ID_VALIDATION_FAILED;
    });
  }

  async getCaseById(caseId: string): Promise<any> {
    const userToken = await this._authenticationService.getCaseworkSystemToken();
    const userId = await this._authenticationService.getCaseworkSystemUUID(userToken);
    const headers = await this.getHeaders(userToken);

    return axios.get(
      `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}`, {
        headers: headers
      }
    );
  }

  async givenAppellantAccess(caseId: string, appellantId: string): Promise<any> {
    const userToken = await this._authenticationService.getCaseworkSystemToken();
    const userId = await this._authenticationService.getCaseworkSystemUUID(userToken);
    const headers = await this.getHeaders(userToken);

    return axios.post(
      `${ccdBaseUrl}/caseworkers/${userId}/jurisdictions/${jurisdictionId}/case-types/${caseType}/cases/${caseId}/users`, {
        id: appellantId
      }, {
        headers: headers
      }
    );
  }

  private async getHeaders(userToken: string) {
    const serviceToken = await this._s2sService.getServiceToken();
    return {
      Authorization: `Bearer ${userToken}`,
      ServiceAuthorization: serviceToken,
      'content-type': 'application/json'
    };
  }
}
