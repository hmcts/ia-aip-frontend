import * as Express from 'express';

export interface Request extends Express.Request {
  session: [any];
  idam: any;
}
