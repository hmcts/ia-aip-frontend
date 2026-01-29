declare namespace Express {
  interface Request {
    idam?: {
      userDetails: IdamDetails;
    };
  }

  interface Partial<SessionData> {
    appeal?: Appeal;
    [key: string]: any;
  }
}
