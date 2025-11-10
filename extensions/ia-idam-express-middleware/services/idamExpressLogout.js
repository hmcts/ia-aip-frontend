const idamWrapper = require('../wrapper');
const request = require('request-promise-native');
const cookies = require('../utilities/cookies');
const config = require('../config');
const IdamLogger = require('./Logger');


const idamExpressLogout = (args = {}) => {
  const idamFunctions = idamWrapper.setup(args);
  const logger = new IdamLogger(args);

  const tokenCookieName = args.tokenCookieName || config.tokenCookieName;

  return (req, res, next) => {
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
        logger.info('Token successfully deleted');
        // if logout is successfull remove token cookie
        cookies.remove(res, tokenCookieName);
        next();
      })
      .catch(error => {
        logger.error(`Token deletion failed with error ${error}`);
        next();
      });
  };
};

module.exports = idamExpressLogout;
