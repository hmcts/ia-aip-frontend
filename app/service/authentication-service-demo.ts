import { Request } from 'express';
import IdamService from './idam-service';
import S2SService from './s2s-service';

interface SecurityHeadersDemo {
  serviceToken: string;
  userToken: string;
  oathProxyToken: string;
  accept?: string;
  experimental?: string;
}

export {
  SecurityHeadersDemo
};

class AuthenticationServiceDemo {
  private idamService;
  private s2sService;

  constructor(idamService: IdamService, s2sService: S2SService) {
    this.idamService = idamService;
    this.s2sService = s2sService;
  }
  async getSecurityHeadersDemo(req: Request): Promise<SecurityHeadersDemo> {
    const userToken = this.idamService.getUserToken(req);
    const oathProxyToken = this.idamService.getOath2ProxyToken(req);
    const serviceToken = await this.s2sService.getServiceToken();
    return { userToken, serviceToken, oathProxyToken };
  }
}

export {
  AuthenticationServiceDemo
};
