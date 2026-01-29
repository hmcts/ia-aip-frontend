import type { Request } from 'express-serve-static-core';
import * as refDataApi from '../api/ref-data-api';
import { AuthenticationService, SecurityHeaders } from './authentication-service';

export default class RefDataService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  async getCommonRefData(req: Request<Params>, dataType) {
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const commonRefData = await refDataApi.commonRefDataLov(securityHeaders, dataType);
    return JSON.stringify(commonRefData.data);
  }
}
