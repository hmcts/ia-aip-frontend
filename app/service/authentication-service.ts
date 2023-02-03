import { Request } from 'express';
import IdamService from './idam-service';
import S2SService from './s2s-service';

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
    if (req.idam && req.idam.userDetails) {
      req.idam.userDetails.uid = req.idam.userDetails.id;
    }
    const userToken = this.idamService.getUserToken(req);
    const serviceToken = await this.s2sService.getServiceToken();
    return { userToken, serviceToken };
  }
}

export {
  AuthenticationService
};
