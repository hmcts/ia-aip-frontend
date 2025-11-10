const request = require('request-promise-native');

const getUserDetails = (authToken, args) => {
  const userDetailsEndpoint = args.openId ? '/o/userinfo' : '/details';

  const options = {
    uri: `${args.idamApiUrl}${userDetailsEndpoint}`,
    headers: { Authorization: `Bearer ${authToken}` },
    json: true
  };

  return request.get(options);
};

module.exports = getUserDetails;
