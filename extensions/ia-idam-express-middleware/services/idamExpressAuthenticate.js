const idamWrapper = require('../wrapper');
const UUID = require('uuid/v4');
const config = require('../config');
const cookies = require('../utilities/cookies');
const IdamLogger = require('./Logger');

const idamExpressAuthenticate = (args = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new IdamLogger(args);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;
  const stateCookieName = args.stateCookieName || config.stateCookieName;

  return (req, res, next) => {
    const stateCookie = cookies.get(req, stateCookieName);
    if (stateCookie) {
      cookies.remove(res, stateCookieName);
    }

    const getState = args.state || UUID;

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
          logger.error(`User is not authenticated: ${error}`);
          redirectUser();
        });
    } else {
      redirectUser();
    }
  };
};

module.exports = idamExpressAuthenticate;
