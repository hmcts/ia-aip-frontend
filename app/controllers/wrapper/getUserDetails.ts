const req = require('request-promise-native');

const getUserDetails = function (authToken, args) {
  const userDetailsEndpoint = args.openId ? '/o/userinfo' : '/details';

  const options = {
    uri: `${args.idamApiUrl}${userDetailsEndpoint}`,
    headers: { Authorization: `Bearer ${authToken}` },
    json: true
  };

  return req.get(options);
};

module.exports = getUserDetails;
