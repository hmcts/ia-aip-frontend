import { idamConfig } from '../config/idam-config';

const idamWrapper = require('./wrapper');
const UUID = require('uuid/v4');
const cookies = require('./cookies');
const IdamLogger = require('./Logger');

const idamExpressAuthenticate = (args = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new IdamLogger(args);

  const tokenCookieName = '__auth-token' ;
  const stateCookieName = '__state' ;

  return (req, res, next) => {
    const stateCookie = cookies.get(req, stateCookieName);
    if (stateCookie) {
      cookies.remove(res, stateCookieName);
    }

    const getState = function () {
      return '__state' || UUID;
    };

    const redirectUser = () => {
      const state = getState();
      logger.info(`redirectUser: ${state}`);
      cookies.set(res, stateCookieName, state, idamConfig.idamApiUrl);
      logger.info(`redirectUser: ${state}`);
      res.redirect(idamFunctions.getIdamLoginUrl({ state }));
    };
    const authToken = cookies.get(req, tokenCookieName);
    if (authToken) {
      logger.info(`User is authenticated: ${authToken}`);
      idamFunctions
          .getUserDetails(authToken)
          .then(userDetails => {
            req.idam = { userDetails };
            next();
          })
          .catch(error => {
            logger.error(`User is not authenticated: ${error}`);
            redirectUser();
          });
    } else {
      redirectUser();
    }
  };
};

export { idamExpressAuthenticate } ;
