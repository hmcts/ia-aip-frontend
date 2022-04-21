import { setupSecrets } from '../../setupSecrets';

import { loginUrl } from './loginUrl';
const userDetails = require('./getUserDetails');
const accessToken = require('./accessToken');
const serviceAuth = require('./getServiceAuth');

const setup = function (args = {}) {
  const getIdamLoginUrl = options => {
    return loginUrl(options, args);
  };

  const config = setupSecrets();

  const getIdamApiUrl = () => {
    return config.get('idam.apiUrl');
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

export { setup };
