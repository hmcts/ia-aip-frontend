import { NextFunction, Request, Response } from 'express';
import request from 'request-promise-native';
import Logger, { getLogLabel } from '../../../utils/logger';
import config from '../config';
import cookies from '../utilities/cookies';
import idamWrapper from '../wrapper';

const idamExpressLogout = (args: IdamConfig = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new Logger();
  const logLabel = getLogLabel(__filename);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;

  return (req: Request, res: Response, next: NextFunction) => {
    const authToken = cookies.get(req, tokenCookieName);
    const logoutUrl = `${idamFunctions.getIdamApiUrl()}/session/${authToken}`;
    const options = {
      uri: logoutUrl,
      headers: {
        Authorization: `Basic ${idamFunctions.getServiceAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    return request.delete(options)
      .then(() => {
        logger.trace('Token successfully deleted', logLabel);
        // if logout is successfull remove token cookie
        cookies.remove(res, tokenCookieName);
        next();
      })
      .catch(error => {
        logger.exception(`Token deletion failed with error ${error}`, logLabel);
        next();
      });
  };
};

export default idamExpressLogout;
