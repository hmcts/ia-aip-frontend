declare namespace Express {
  interface Request {
    idam?: {
      userDetails: IdamDetails;
    };
    csrfToken?: () => string;
  }

  interface Partial<SessionData> {
    appeal?: Appeal;
    [key: string]: any;
  }
}
