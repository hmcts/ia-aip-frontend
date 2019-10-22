import * as Express from 'express';
import { Section } from './section';

export interface Request {
  session: {
    appealApplication: any,
    caseBuilding: any,
    hearingRequirements: any
  };
  idam: any;
  sectionStatuses: [ Section ];
}
