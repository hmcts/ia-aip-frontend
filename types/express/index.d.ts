declare namespace Express {
  interface Request {
    idam?: {
      userDetails: IdamDetails;
    };
    csrfToken?: () => string;
  }

  interface Partial<SessionData> {
    appeal?: Appeal;
    casesList?: CaseListItem[];
    isNonLegalRep?: boolean;
    [key: string]: any;
  }
}
