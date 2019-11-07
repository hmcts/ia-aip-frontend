import { Request } from 'express';
import IdamService from './idam-service';
import s2sService from './s2s-service';

const s2SService = s2sService.getInstance();
const idamService = new IdamService();

interface SecurityHeaders {
  serviceToken: String;
  userToken: String;
}

async function getSecurityHeaders(req: Request): Promise<SecurityHeaders> {
  const userToken = idamService.getUserToken(req);
  const serviceToken = await s2SService.getServiceToken();
  // @ts-ignore
  return { userToken, serviceToken };
}

export {
  getSecurityHeaders,
  SecurityHeaders
};
