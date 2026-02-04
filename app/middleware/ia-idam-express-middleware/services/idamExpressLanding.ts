import { NextFunction, Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import Logger, { getLogLabel } from '../../../utils/logger';
import config from '../config';
import cookies from '../utilities/cookies';
import idamWrapper from '../wrapper';

const idamExpressLanding = (args: IdamConfig) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new Logger();
  const logLabel = getLogLabel(__filename);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;
  const stateCookieName = args.stateCookieName || config.stateCookieName;

  return (req: Request, res: Response, next: NextFunction) => {
    const authToken: string = req.query[tokenCookieName] as string;
    const code = req.query.code;

    // If no code then landing page was not reached through IDAM
    if (!code) {
      if (authToken) {
        try {
          // validate authToken, do nothing if error
          jwtDecode(authToken);

          cookies.set(res, tokenCookieName, authToken, args.hostName);
          // set cookie on req so it can be used during this request
          req.cookies = req.cookies || {};
          req.cookies[tokenCookieName] = authToken;
          idamFunctions.getUserDetails(authToken)
            .then(userDetails => {
              req.idam = { userDetails };
              next();
            })
            .catch(error => {
              logger.exception(`An error occurred when authenticating the user: ${error}`, logLabel);
              res.redirect(args.indexUrl);
            });
        } catch (error) {
          next();
        }
      } else {
        logger.exception('Code has not been set on the query string', logLabel);
        res.redirect(args.indexUrl);
      }
      return;
    }

    const state = cookies.get(req, stateCookieName) || req.query.state;
    if (!state) {
      logger.exception('State cookie does not exist', logLabel);
      res.redirect(args.indexUrl);
      return;
    }

    cookies.remove(res, stateCookieName);

    idamFunctions
      .getAccessToken({
        code,
        state,
        redirect_uri: args.redirectUri
      })
      .then(response => {
        cookies.set(res, tokenCookieName, response.access_token, args.hostName);
        // set cookie on req so it can be used during this request
        req.cookies = req.cookies || {};
        req.cookies[tokenCookieName] = response.access_token;
        return idamFunctions
          .getUserDetails(response.access_token);
      })
      .then(userDetails => {
        req.idam = { userDetails };
        next();
      })
      .catch(error => {
        logger.exception(`An error occurred when authenticating the user: ${error}`, logLabel);
        res.redirect(args.indexUrl);
      });
  };
};

export default idamExpressLanding;
