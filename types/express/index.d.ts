declare namespace Express {
  interface Request {
    idam?: {
      userDetails: IdamDetails;
    }
  }

  interface SessionData {
    appeal?: Appeal;
  }
}
