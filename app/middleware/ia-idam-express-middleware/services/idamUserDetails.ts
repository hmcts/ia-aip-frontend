import { NextFunction, Request, Response } from 'express';
import Logger, { getLogLabel } from '../../../utils/logger';
import config from '../config';
import cookies from '../utilities/cookies';
import idamWrapper from '../wrapper';

const idamExpressUserDetails = (args: IdamConfig = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new Logger();
  const logLabel = getLogLabel(__filename);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;

  return (req: Request, res: Response, next: NextFunction) => {
    const authToken = cookies.get(req, tokenCookieName);

    if (authToken) {
      idamFunctions
        .getUserDetails(authToken)
        .then(userDetails => {
          req.idam = { userDetails };
          next();
        })
        .catch(error => {
          logger.exception(`User failed authentication when getting user details: ${error}`, logLabel);
          cookies.remove(res, tokenCookieName);
          next();
        });
    } else {
      next();
    }
  };
};

export default idamExpressUserDetails;
