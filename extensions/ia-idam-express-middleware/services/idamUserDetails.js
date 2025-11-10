const idamWrapper = require('../wrapper');
const config = require('../config');
const cookies = require('../utilities/cookies');
const IdamLogger = require('./Logger');

const idamExpressUserDetails = (args = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new IdamLogger(args);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;

  return (req, res, next) => {
    const authToken = cookies.get(req, tokenCookieName);

    if (authToken) {
      idamFunctions
        .getUserDetails(authToken, args)
        .then(userDetails => {
          req.idam = { userDetails };
          next();
        })
        .catch(error => {
          logger.error(`User failed authentication when getting user details: ${error}`);
          cookies.remove(res, tokenCookieName);
          next();
        });
    } else {
      next();
    }
  };
};

module.exports = idamExpressUserDetails;
