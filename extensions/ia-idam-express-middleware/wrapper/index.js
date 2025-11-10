const loginUrl = require('./loginUrl');
const userDetails = require('./getUserDetails');
const accessToken = require('./accessToken');
const serviceAuth = require('./getServiceAuth');

const setup = (args = {}) => {
  const getIdamLoginUrl = options => {
    return loginUrl(options, args);
  };

  const getIdamApiUrl = () => {
    return args.idamApiUrl;
  };

  const getUserDetails = authToken => {
    return userDetails(authToken, args);
  };

  const getAccessToken = options => {
    return accessToken(options, args);
  };

  const getServiceAuth = () => {
    return serviceAuth(args);
  };

  return {
    getIdamLoginUrl,
    getUserDetails,
    getAccessToken,
    getIdamApiUrl,
    getServiceAuth
  };
};

module.exports = { setup };
