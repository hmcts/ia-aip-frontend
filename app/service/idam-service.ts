import { Request } from 'express';

export default class IdamService {
  getUserToken(req: Request) {
    return `Bearer ${req.cookies['__auth-token']}`;
  }

  getOath2ProxyToken(req: Request) {
    return `Bearer ${req.cookies['_oauth2_proxy']}`;
  }
}
