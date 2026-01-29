import type { Request } from 'express-serve-static-core';

export default class IdamService {
  getUserToken(req: Request<Params>) {
    return `Bearer ${req.cookies['__auth-token']}`;
  }
}
