import url from 'url';
import { IdamConfig } from '../../../../types';

const defaultQueryStringParams = { response_type: 'code' };

const loginUrl = (options = {}, args: IdamConfig = {}) => {
  const queryString = Object.assign({
    client_id: args.idamClientID,
    redirect_uri: args.redirectUri
  }, defaultQueryStringParams, options);

  return args.idamLoginUrl + url.format({ query: queryString });
};

export default loginUrl;
