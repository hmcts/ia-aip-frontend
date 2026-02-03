import { NextFunction, Response } from 'express';
import type { Request } from 'express-serve-static-core';
import { v4 as uuidv4 } from 'uuid';
import Logger, { getLogLabel } from '../../../utils/logger';
import config from '../config';
import cookies from '../utilities/cookies';
import idamWrapper from '../wrapper';

const idamExpressAuthenticate = (args: IdamConfig) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new Logger();
  const logLabel = getLogLabel(__filename);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;
  const stateCookieName = args.stateCookieName || config.stateCookieName;

  return (req: Request<Params>, res: Response, next: NextFunction) => {
    const stateCookie = cookies.get(req, stateCookieName);
    if (stateCookie) {
      cookies.remove(res, stateCookieName);
    }

    const getState = args.state || uuidv4;

    const redirectUser = () => {
      const state = getState();
      cookies.set(res, stateCookieName, state, args.hostName);
      res.redirect(idamFunctions.getIdamLoginUrl({ state }));
    };

    const authToken = cookies.get(req, tokenCookieName);
    if (authToken) {
      idamFunctions
        .getUserDetails(authToken)
        .then(userDetails => {
          req.idam = { userDetails };
          next();
        })
        .catch(error => {
          logger.exception(`User is not authenticated: ${error}`, logLabel);
          redirectUser();
        });
    } else {
      redirectUser();
    }
  };
};

export default idamExpressAuthenticate;
