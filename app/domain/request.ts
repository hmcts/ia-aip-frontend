import * as Express from 'express';

export interface Request extends Express.Request {
  session: {
    appealApplication: any,
    caseBuilding: any,
    hearingRequirements: any
  };
  idam: any;
}
