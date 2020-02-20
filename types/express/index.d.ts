declare namespace Express {
  interface Request {
    idam?: {
      userDetails: IdamDetails;
    };
    csrfToken?: () => string;
  }

  interface SessionData {
    appeal?: Appeal;
  }
}
