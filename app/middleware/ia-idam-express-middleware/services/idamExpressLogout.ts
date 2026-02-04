import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import Logger, { getLogLabel } from '../../../utils/logger';
import config from '../config';
import cookies from '../utilities/cookies';
import idamWrapper from '../wrapper';

const idamExpressLogout = (args: IdamConfig = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new Logger();
  const logLabel = getLogLabel(__filename);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;

  return async (req: Request, res: Response, next: NextFunction) => {
    const authToken = cookies.get(req, tokenCookieName);
    const logoutUrl = `${idamFunctions.getIdamApiUrl()}/session/${authToken}`;
    const options = {
      headers: {
        Authorization: `Basic ${idamFunctions.getServiceAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    try {
      await axios.delete(logoutUrl, options);
      logger.trace('Token successfully deleted', logLabel);
      cookies.remove(res, tokenCookieName);
      next();
    } catch (error) {
      logger.exception(`Token deletion failed with error ${error}`, logLabel);
      next();
    }
  };
};

export default idamExpressLogout;
