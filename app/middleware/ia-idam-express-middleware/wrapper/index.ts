import { IdamConfig } from '../../../../types';

import accessToken from './accessToken';
import serviceAuth from './getServiceAuth';
import userDetails from './getUserDetails';
import loginUrl from './loginUrl';

export const setup = (args: IdamConfig = {}) => {
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

const idamWrapper = { setup };
export default idamWrapper;
