import { Request } from 'express';
import Logger, { getLogLabel } from '../utils/logger';
import IdamService from './idam-service';
import S2SService from './s2s-service';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

interface SecurityHeaders {
  serviceToken: string;
  userToken: string;
  accept?: string;
  experimental?: string;
}

export {
  SecurityHeaders
};

class AuthenticationService {
  private idamService;
  private s2sService;

  constructor(idamService: IdamService, s2sService: S2SService) {
    this.idamService = idamService;
    this.s2sService = s2sService;
  }

  async getSecurityHeaders(req: Request): Promise<SecurityHeaders> {
    logger.trace('Getting security headers...', logLabel);
    const userToken = this.idamService.getUserToken(req);
    const serviceToken = await this.s2sService.getServiceToken();
    logger.trace(`Security headers retrieved - userToken present: ${!!userToken && userToken !== 'Bearer undefined'}, serviceToken present: ${!!serviceToken && serviceToken !== 'Bearer undefined'}`, logLabel);
    return { userToken, serviceToken };
  }
}

export {
  AuthenticationService
};
