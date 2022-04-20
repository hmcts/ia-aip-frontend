import { idamConfig } from '../../config/idam-config';

const url = require('url');

const defaultQueryStringParams = { response_type: 'code' };

const loginUrl = function (options = {}, args = {}) {
  const queryString = Object.assign({
    client_id: idamConfig.idamClientID,
    redirect_uri: idamConfig.redirectUri
  }, defaultQueryStringParams, options);

  return idamConfig.idamLoginUrl + url.format({ query: queryString });
};

export { loginUrl };
